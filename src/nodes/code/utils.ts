import path from 'path';
import fs from 'fs';
import { GraphState } from '../../state';
import { logger } from '../../utils/logger';
import { callModel } from '../../utils/call-model';
import { saveContentToFile, createFilesFromParsedData } from '../../utils/file-operator';
import { extractCode, extractFilesFromContent } from '../../utils/response-parser';
import { promisePool } from '../../utils/promise-pool';
import { generateFramePrompt, generateComponentPrompt, injectRootComponentPrompt } from './prompt';
import { FrameStructNode } from '../../types';

/**
 * Track generated reusable components to avoid duplicates
 */
const generatedComponentNames = new Set<string>();

const DEFAULT_STYLING = {
    approach: 'Tailwind V4 and Less',
    libraries: [
        {
            name: 'Tailwind V4',
            role: 'utility_first',
        },
        {
            name: 'Less',
            role: 'css_preprocessor',
        },
    ],
};

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
export async function processNode(node: FrameStructNode, state: GraphState): Promise<number> {
    // Reset component cache for new generation run
    generatedComponentNames.clear();

    // Read asset files list once for the entire generation run
    const assetFilesList = getAssetFilesList(state);

    // Flatten tree using post-order traversal (children first, then parent)
    const flatNodes = flattenPostOrder(node);
    const total = flatNodes.length;

    if (total === 0) {
        logger.printWarnLog('No components found in structure to generate.');
        return 0;
    }

    logger.printInfoLog(`Processing ${total} nodes...`);

    let processedCount = 0;

    const processSingleNode = async (currentNode: FrameStructNode) => {
        const progressInfo = `[${++processedCount}/${total}]`;

        const reusableName = currentNode.data.componentName;

        if (reusableName) {
            // Reusable component: Generate definition if not already generated
            if (!generatedComponentNames.has(reusableName)) {
                generatedComponentNames.add(reusableName);
                await generateComponent(currentNode, state, progressInfo);
            } else {
                logger.printInfoLog(`  ↪ Skipping ${reusableName} (already generated)`);
            }
        } else {
            const isLeaf = !currentNode.children?.length;
            if (isLeaf) {
                await generateComponent(currentNode, state, progressInfo);
            } else {
                await generateFrame(currentNode, state, assetFilesList, progressInfo);
            }
        }
    };

    // Process nodes with concurrency control
    await promisePool(flatNodes, processSingleNode);

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
    logger.printInfoLog(`${progressInfo} 🖼️ Generating Frame: ${frameName}`);

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
        imageUrls: state.processedFigma?.thumbnailUrl,
    });

    // Save generated files
    const componentPath = node.data.path || '';
    const filePath = path.join(state.workspace.app, 'src', getComponentPathFromPath(componentPath));

    saveGeneratedCode(code, filePath);

    //TODO: debug
    const processFilePath = path.join(state.workspace.process, `${frameName}.json`);
    saveContentToFile(code, processFilePath);
}

/**
 * Generate a component (leaf or reusable)
 * Components are self-contained UI elements driven by props
 */
export async function generateComponent(node: FrameStructNode, state: GraphState, progressInfo: string): Promise<void> {
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
    });

    // Call AI model
    const code = await callModel({
        question: prompt,
        imageUrls: state.processedFigma?.thumbnailUrl,
    });

    // Save generated files
    const filePath = path.join(state.workspace.app, 'src', getComponentPathFromPath(componentPath));

    //TODO: debug
    const processFilePath = path.join(state.workspace.process, `${componentName}.json`);
    saveContentToFile(code, processFilePath);

    saveGeneratedCode(code, filePath);
}

/**
 * Helper function to save generated code (handles both single and multi-file output)
 */
function saveGeneratedCode(code: string, filePath: string): void {
    const files = extractFilesFromContent(code);

    if (files.length > 0) {
        // Multi-file output (e.g., index.tsx + index.module.less)
        const dirPath = path.dirname(filePath);
        createFilesFromParsedData({ files, dirPath });
    } else {
        // Single file output
        const extractedCode = extractCode(code);
        saveContentToFile(extractedCode, filePath);
    }
}

/**
 * Get list of available asset files for AI to match against
 */
function getAssetFilesList(state: GraphState) {
    try {
        const assetsDir = path.join(state.workspace.app, 'src', 'assets');

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
export async function injectRootComponentToApp(rootNode: FrameStructNode, state: GraphState): Promise<void> {
    try {
        logger.printInfoLog('💉 Injecting root component into App.tsx...');

        // Construct App.tsx path
        const appTsxPath = path.join(state.workspace.app, 'src/App.tsx');

        // Read existing App.tsx or use default template
        let appContent: string;
        try {
            appContent = fs.readFileSync(appTsxPath, 'utf8');
        } catch {
            // Use default template if App.tsx doesn't exist
            logger.printWarnLog('App.tsx not found, using default template');
            appContent = `function App() {
    return (
        <div>
            {/* Component will be injected here */}
        </div>
    );
}

export default App;`;
        }

        // Get root component information
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
        saveContentToFile(finalCode, appTsxPath);

        logger.printSuccessLog(`✅ Successfully injected ${componentName} into App.tsx`);
    } catch (error) {
        logger.printErrorLog(`Failed to inject root component: ${(error as Error).message}`);
        // Don't throw - allow the process to continue even if injection fails
    }
}
