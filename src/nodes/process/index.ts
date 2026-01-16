import { GraphState } from '../../state';
import { figmaTool } from '../../tools/figma-tool';
import { FigmaUrlInfo } from '../../types/figma-types';
import { getFigmaConfig } from '../../utils/config';
import { writeFile } from '../../utils/file';
import { logger } from '../../utils/logger';
import { generateStructure } from './structure';

/**
 * 'process' node, responsible for generating the protocol for frontend code generation.
 *
 * This function serves as a unified workflow that can be consumed by:
 * 1. LangGraph Node: As part of the design2code graph workflow
 * 2. CLI Command: `f2p` (figma2protocol) - full protocol generation
 * 3. CLI Command: `images` (get-images) - partial workflow (fetch + download only)
 * 4. Script Execution: Direct execution via tsx/node
 *
 * Workflow Steps:
 * - Step 1: Fetch and clean Figma document from API
 * - Step 2: Detect and download images from Figma document
 * - Step 3: Simplify image nodes by replacing properties with URLs
 * - Step 4: Process styles (convert Figma styles to CSS)
 * - Step 5: Write protocol.json and images.json to workspace
 * @param state - The state of the graph.
 * @returns The state of the graph.
 */
export const generateProtocol = async (state: GraphState) => {
    const assetsDir = state.workspace.resolveAppSrc('assets');
    const processDir = state.workspace.paths.process;
    const { document, results } = await executeFigmaAndImagesActions(state.urlInfo, assetsDir, processDir);

    /* Simplify image nodes in Figma document by replacing redundant properties with url */
    const simplifiedDocument = figmaTool.simplifyImageNodes(document, results);
    /* Process styles (convert Figma styles to CSS) */
    const processedStyleDocument = figmaTool.processedStyle(simplifiedDocument);
    /* Generate structure */
    const protocol = await generateStructure(processedStyleDocument);

    writeFile(state.workspace.paths.process, 'protocol.json', JSON.stringify(protocol, null, 2));
    logger.printInfoLog(`Please check the output in the workspace: ${state.workspace.paths.process}`);

    return {
        protocol,
        figmaInfo: {
            thumbnail: document?.thumbnailUrl || '',
        },
    };
};

/**
 * Executes the Figma and images actions.
 * @param state - The state of the graph.
 * @returns The state of the graph.
 */
export const executeFigmaAndImagesActions = async (urlInfo: FigmaUrlInfo, assetsDir: string, processDir: string) => {
    const { fileId, nodeId } = urlInfo;
    if (!fileId || !nodeId) {
        throw new Error('Invalid Figma URL');
    }

    const token = getFigmaConfig().token;
    if (!token) {
        throw new Error('Figma API token is required');
    }

    /* Fetch and clean Figma document */
    const document = await figmaTool.fetchAndClean(fileId, nodeId, token);
    if (!document) {
        throw new Error('Failed to fetch and clean Figma document');
    }
    logger.printSuccessLog(`Figma document fetched and cleaned successfully: ${document.name}`);

    /* Detect and download images from Figma document */
    const { successCount, failCount, results } = await figmaTool.downloadImages(fileId, token, assetsDir, document);
    if (successCount) {
        logger.printSuccessLog(`Downloaded ${successCount} images`);
    }
    if (failCount) {
        logger.printWarnLog(`Failed to download ${failCount} images`);
    }
    writeFile(processDir, 'images.json', JSON.stringify(results, null, 2));

    return {
        document,
        results,
    };
};
