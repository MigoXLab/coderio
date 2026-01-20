import fs from 'fs';
import { GraphState } from '../../state';
import { logger } from '../../utils/logger';
import { callModel } from '../../utils/call-model';
import { promisePool } from '../../utils/promise-pool';
import { generateFramePrompt, generateComponentPrompt, injectRootComponentPrompt } from './prompt';
import { FrameStructNode } from '../../types';
import { createFiles, writeFile } from '../../utils/file';
import { DEFAULT_APP_CONTENT, DEFAULT_STYLING } from './constants';
import path from 'path';
import { extractCode, extractFiles } from '../../utils/parser';
import { resolveAppSrc } from '../../utils/workspace';
import { CodeCache, isComponentGenerated, saveComponentGenerated, isAppInjected, saveAppInjected } from '../../utils/code-cache';

/**
 * Convert a component path to the actual file system path
 * Handles @/ alias and ensures .tsx extension
 */
function getComponentPathFromPath(componentPath: string): string {
    // Remove @/ alias if present
    let normalizedPath = componentPath.replace(/^@\//, '');

    // If path doesn't end with .tsx or .ts, assume it's a directory and add index.tsx
    if (!normalizedPath.endsWith('.tsx') && !normalizedPath.endsWith('.ts')) {
        normalizedPath = path.join(normalizedPath, 'index.tsx');
    }

    return normalizedPath;
}

/**
 * Process a node tree and generate code for all nodes
 * Uses post-order traversal (children first, then parent)
 */
export async function processNode(state: GraphState, cache: CodeCache): Promise<number> {
    // Read asset files list once for the entire generation run
    const assetFilesList = getAssetFilesList(state);

    // Flatten tree using post-order traversal (children first, then parent)
    const flatNodes = flattenPostOrder(state.protocol!);
    const total = flatNodes.length;

    if (total === 0) {
        logger.printWarnLog('No components found in structure to generate.');
        return 0;
    }

    logger.printInfoLog(`Processing ${total} nodes...`);

    let processedCount = 0;
    let skippedCount = 0;

    const processSingleNode = async (currentNode: FrameStructNode) => {
        const componentName = currentNode.data.name || currentNode.data.componentName || 'UnknownComponent';
        const nodeId = currentNode.id;

        // Check if component is already generated
        if (isComponentGenerated(cache, nodeId)) {
            skippedCount++;
            logger.printInfoLog(`[${processedCount + skippedCount}/${total}] ⏭️  Skipping (cached): ${componentName}`);
            return;
        }

        const progressInfo = `[${++processedCount + skippedCount}/${total}]`;

        const isLeaf = !currentNode.children?.length;
        if (isLeaf) {
            await generateComponent(currentNode, state, assetFilesList, progressInfo);
        } else {
            await generateFrame(currentNode, state, assetFilesList, progressInfo);
        }

        // Mark component as generated and save immediately to prevent cache loss on interruption
        saveComponentGenerated(cache, nodeId, state.workspace);
    };

    // Process nodes with concurrency control
    await promisePool(flatNodes, processSingleNode);

    if (skippedCount > 0) {
        logger.printInfoLog(`⏭️  Skipped ${skippedCount} cached components`);
    }
    logger.printSuccessLog(`✅ Generated ${processedCount} components`);
    return processedCount;
}

/**
 * Flatten tree into array using post-order traversal
 */
function flattenPostOrder(node: FrameStructNode): FrameStructNode[] {
    const result: FrameStructNode[] = [];

    function traverse(n: FrameStructNode) {
        n.children?.forEach(child => traverse(child));
        result.push(n);
    }

    traverse(node);
    return result;
}

/**
 * Generate a frame/container component
 * Frames compose multiple child components based on layout
 */
export async function generateFrame(node: FrameStructNode, state: GraphState, assetFilesList: string, progressInfo: string): Promise<void> {
    const frameName = node.data.name;
    logger.printInfoLog(`${progressInfo} 🖼️  Generating Frame: ${frameName}`);

    // Build children imports information
    const childrenImports = (node.children || []).map(child => ({
        name: child.data.componentName || child.data.name || '',
        path: child.data.componentPath || child.data.path,
        properties: child.data.componentProperties,
    }));

    // Generate prompt
    const prompt = generateFramePrompt({
        layoutData: JSON.stringify(node.data.layout || {}),
        figmaData: JSON.stringify(node.data),
        childrenImports: JSON.stringify(childrenImports),
        cssContext: JSON.stringify(node.data.elements),
        styling: JSON.stringify(DEFAULT_STYLING),
        assetFiles: assetFilesList,
    });

    // Call AI model
    const code = await callModel({
        question: prompt,
        imageUrls: state.figmaInfo.thumbnail,
    });

    // Save generated files
    const componentPath = node.data.path || '';
    const filePath = resolveAppSrc(state.workspace, getComponentPathFromPath(componentPath));
    saveGeneratedCode(code, filePath);
}

/**
 * Generate a component (leaf or reusable)
 * Components are self-contained UI elements driven by props
 */
export async function generateComponent(
    node: FrameStructNode,
    state: GraphState,
    assetFilesList: string,
    progressInfo: string
): Promise<void> {
    const componentName = node.data.componentName || node.data.name || 'UnknownComponent';
    const componentPath = node.data.componentPath || node.data.path || '';

    logger.printInfoLog(`${progressInfo} 📦 Generating Component: ${componentName}`);

    // Extract CSS context with full subtree
    const cssContext = JSON.stringify(node.data.elements);

    // Prepare Figma data with children info for context
    const figmaDataObj = {
        ...node.data,
        children: (node.children || []).map(child => ({
            id: child.id,
            name: child.data.name,
            componentName: child.data.componentName,
            path: child.data.componentPath || child.data.path,
            properties: child.data.componentProperties,
        })),
    };

    // Generate prompt
    const prompt = generateComponentPrompt({
        componentName,
        figmaData: JSON.stringify(figmaDataObj),
        cssContext,
        styling: JSON.stringify(DEFAULT_STYLING),
        assetFiles: assetFilesList,
    });

    // Call AI model
    const code = await callModel({
        question: prompt,
        imageUrls: state.figmaInfo.thumbnail,
    });

    // Save generated files
    const filePath = resolveAppSrc(state.workspace, getComponentPathFromPath(componentPath));
    saveGeneratedCode(code, filePath);
}

/**
 * Helper function to save generated code (handles both single and multi-file output)
 */
function saveGeneratedCode(code: string, filePath: string): void {
    const files = extractFiles(code);

    if (files.length > 0) {
        // Multi-file output (e.g., index.tsx + index.module.less)
        createFiles({ files, filePath });
    } else {
        const extractedCode = extractCode(code);
        const folderPath = path.dirname(filePath);
        const fileName = path.basename(filePath);
        writeFile(folderPath, fileName, extractedCode);
    }
}

/**
 * Get list of available asset files for AI to match against
 */
function getAssetFilesList(state: GraphState) {
    try {
        const assetsDir = resolveAppSrc(state.workspace, 'assets');

        if (!fs.existsSync(assetsDir)) {
            return '';
        }

        const files = fs.readdirSync(assetsDir);
        return files.join(', ');
    } catch {
        return '';
    }
}

/**
 * Inject root component into App.tsx
 * Reads existing App.tsx, adds import and renders the root component
 */
export async function injectRootComponentToApp(state: GraphState, cache: CodeCache): Promise<void> {
    try {
        // Check if already injected
        if (isAppInjected(cache)) {
            logger.printInfoLog('⏭️  Skipping App.tsx injection (already injected)');
            return;
        }

        logger.printInfoLog('💉 Injecting root component into App.tsx...');

        // Construct App.tsx path
        const appTsxPath = resolveAppSrc(state.workspace, 'App.tsx');

        // Read existing App.tsx or use default template
        let appContent: string;
        try {
            appContent = fs.readFileSync(appTsxPath, 'utf8');
        } catch {
            // Use default template if App.tsx doesn't exist
            logger.printWarnLog('App.tsx not found, using default template');
            appContent = DEFAULT_APP_CONTENT;
        }

        // Get root component information
        const rootNode = state.protocol!;
        const componentName = rootNode.data.name || 'RootComponent';
        const componentPath = rootNode.data.path || '';

        // Generate prompt
        const prompt = injectRootComponentPrompt({
            appContent,
            componentName,
            componentPath,
        });

        // Call AI model
        const updatedCode = await callModel({
            question: prompt,
        });

        // Extract code (no markdown blocks expected based on prompt requirements)
        const finalCode = updatedCode.includes('```') ? extractCode(updatedCode) : updatedCode.trim();

        // Write updated App.tsx
        const appFolderPath = path.dirname(appTsxPath);
        writeFile(appFolderPath, 'App.tsx', finalCode);

        // Mark as injected and save immediately
        saveAppInjected(cache, state.workspace);

        logger.printSuccessLog(`✅ Successfully injected ${componentName} into App.tsx`);
    } catch (error) {
        logger.printErrorLog(`Failed to inject root component: ${(error as Error).message}`);
        // Don't throw - allow the process to continue even if injection fails
    }
}
