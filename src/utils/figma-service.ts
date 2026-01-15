import { FigmaFrameInfo } from '../types/code-types';

/**
 * Options for extracting hierarchical nodes
 */
export interface ExtractOptions {
    includeSubtree?: boolean;
}

/**
 * Service for handling Figma node data extraction and processing
 */
export class FigmaNodeService {
    /**
     * Extract hierarchical nodes by their IDs from frames
     *
     * @param frames - Array of Figma frame information
     * @param elementIds - Array of element IDs to extract
     * @param options - Extraction options (e.g., includeSubtree)
     * @returns Hierarchical structure of matching nodes
     */
    static extractHierarchicalNodesByIds(
        frames: FigmaFrameInfo | FigmaFrameInfo[],
        elementIds: string[],
        options: ExtractOptions = {}
    ): FigmaFrameInfo[] {
        const framesArray = Array.isArray(frames) ? frames : [frames];
        const results: FigmaFrameInfo[] = [];

        // Helper function to recursively search for nodes
        const findNodeById = (node: FigmaFrameInfo, targetId: string): FigmaFrameInfo | null => {
            if (node.id === targetId) {
                return node;
            }

            if (Array.isArray(node.children)) {
                for (const child of node.children) {
                    const found = findNodeById(child, targetId);
                    if (found) return found;
                }
            }

            return null;
        };

        // Extract children recursively if includeSubtree is true
        const extractWithSubtree = (node: FigmaFrameInfo): FigmaFrameInfo => {
            if (options.includeSubtree && Array.isArray(node.children)) {
                return {
                    ...node,
                    children: node.children.map((child: FigmaFrameInfo) => extractWithSubtree(child)),
                };
            }
            // Remove children if not including subtree
            const { ...nodeWithoutChildren } = node;
            return nodeWithoutChildren;
        };

        // Search through all frames for matching element IDs
        for (const elementId of elementIds) {
            for (const frame of framesArray) {
                const found = findNodeById(frame as unknown as FigmaFrameInfo, elementId);
                if (found) {
                    results.push(extractWithSubtree(found));
                    break; // Found in this frame, move to next element ID
                }
            }
        }

        return results;
    }
}
