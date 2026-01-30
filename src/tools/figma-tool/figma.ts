import { FigmaFrameInfo, FigmaImageFormat, FigmaColorObject } from '../../types/figma-types';
import { get } from '../../utils/axios';
import { logger } from '../../utils/logger';

/**
 * Fetch Figma nodes by fileId and nodeId
 * @param fileId - Figma file ID
 * @param nodeId - Figma node ID
 * @param token - Figma API token
 * @returns Figma frame information
 */
export const fetchFigmaNode = async (fileId: string, nodeId: string, token: string): Promise<FigmaFrameInfo | undefined> => {
    const url = `https://api.figma.com/v1/files/${fileId}/nodes?ids=${nodeId}`;
    try {
        const data = await get<{ nodes: Record<string, { document: FigmaFrameInfo }> }>(url, {
            headers: {
                'X-Figma-Token': token,
            },
        });
        // format node id to match the format in the response
        const resData = data.nodes?.[nodeId];
        return resData?.document;
    } catch (error) {
        logger.printErrorLog(`Failed to fetch Figma node: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return undefined;
    }
};

/**
 * Fetch Figma image by fileId and nodeId
 * @param fileId - Figma file ID
 * @param nodeIds - Figma node ID, multiple node ids can be passed separated by commas
 * @param token - Figma API token
 * @param format - Figma image format
 * @returns Figma image
 */
export const fetchFigmaImages = async (
    fileId: string,
    nodeIds: string,
    token: string,
    format?: FigmaImageFormat
): Promise<Record<string, string>> => {
    const url = `https://api.figma.com/v1/images/${fileId}`;
    try {
        const data = await get<{ images: Record<string, string> }>(url, {
            headers: {
                'X-Figma-Token': token,
            },
            params: {
                ids: nodeIds,
                format: format || 'png',
            },
        });
        const images = data.images || {};
        // format node id to match the format from response to request
        return Object.fromEntries(Object.entries(images));
    } catch (error) {
        logger.printErrorLog(`Failed to fetch Figma images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {};
    }
};

/**
 * Clean Figma node and children. Remove invisible nodes and children.
 * @param node - Figma node or children
 * @returns Cleaned Figma node or children. If the node is invisible, return null.
 */
export const cleanFigma = (node: FigmaFrameInfo): FigmaFrameInfo | undefined => {
    // if node is invisible, return undefined
    if (node.visible === false) {
        return undefined;
    }

    // if node has children, recursively clean each child
    if (node.children && Array.isArray(node.children)) {
        node.children = node.children
            .map(child => cleanFigma(child)) // recursively clean each child
            .filter(child => child !== undefined); // filter out invisible nodes
    }

    return node;
};

/**
 * Check if node has border
 * @param node - Figma node
 * @returns True if node has border, false otherwise
 */
export const checkBorder = (node: FigmaFrameInfo): boolean => {
    const strokes = node.strokes;
    const strokeWeight = node.strokeWeight;

    if (!strokes || !strokes.length || !strokeWeight) return false;

    const visibleStrokes = strokes.filter((s: FigmaColorObject) => s.visible !== false);
    if (visibleStrokes.length === 0) return false;

    return true;
};
