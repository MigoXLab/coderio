import type { FigmaFrameInfo, FrameStructNode, FrameData } from '../../../types';
import type { SimplifiedFigmaNode, ExtendedFrameStructNode, ParsedDataListResponse } from './types';
import { toKebabCase } from '../../../utils/naming';
import { extractJSON } from '../../../utils/parser';
import { callModel } from '../../../utils/call-model';
import { logger } from '../../../utils/logger';

// ============= Figma Node Utilities =============
/**
 * Simplifies Figma nodes for content extraction, retaining essential fields for AI processing
 * Removes heavy vector data while keeping text content, images, and layout information
 *
 * @param node - The Figma frame node to simplify
 * @returns Simplified node with only essential fields
 */
export function simplifyFigmaNodeForContent(node: FigmaFrameInfo): SimplifiedFigmaNode {
    const simple: SimplifiedFigmaNode = {
        id: node.id,
        name: node.name,
        type: node.type,
    };

    // Check both url (set by Asset node) and thumbnailUrl (original Figma field)
    const imageUrl = (node as FigmaFrameInfo & { url?: string }).url || node.thumbnailUrl;
    if (imageUrl) {
        simple.url = imageUrl;
    }

    if (node.cornerRadius !== undefined) {
        simple.cornerRadius = node.cornerRadius;
    }

    if (node.characters !== undefined && node.characters !== null) {
        simple.characters = node.characters;
    }

    if (node.visible !== undefined) simple.visible = node.visible;

    if (node.absoluteBoundingBox) simple.absoluteBoundingBox = node.absoluteBoundingBox;

    if (node.children && Array.isArray(node.children)) {
        simple.children = node.children.map(simplifyFigmaNodeForContent);
    }

    if (node.inlineStyles) {
        simple.inlineStyles = node.inlineStyles as Record<string, unknown>;
    }

    if (node.style) {
        simple.style = node.style as unknown as Record<string, unknown>;
    }

    if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
        simple.hasStrokes = true;
    }

    return simple;
}

/**
 * Extract node positions with hierarchical structure preserved
 * Returns nested position data maintaining parent-child relationships
 *
 * @param data - Figma frame data (single frame or array of frames)
 * @returns Hierarchical position data with node information
 */
export function extractNodePositionsHierarchical(data: FigmaFrameInfo[] | FigmaFrameInfo | undefined): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (!data) {
        return result;
    }

    const list = Array.isArray(data) ? data : [data];

    for (const item of list) {
        if (item && typeof item === 'object' && item.id) {
            const nodeData: Record<string, unknown> = {};

            // Extract position information
            const bounds = item.absoluteBoundingBox || item.absoluteRenderBounds;
            if (bounds) {
                nodeData.x = bounds.x;
                nodeData.y = bounds.y;
                nodeData.w = bounds.width;
                nodeData.h = bounds.height;
            }

            // Recursively process children
            if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                nodeData.children = extractNodePositionsHierarchical(item.children);
            }

            result[item.id] = nodeData;
        }
    }

    return result;
}

/**
 * Extract nodes by IDs, including their full subtrees (all children)
 * This allows inspecting the full content of specific component instances
 */
function extractNodesWithSubtreeByIds(tree: FigmaFrameInfo | FigmaFrameInfo[], idList: string[]): FigmaFrameInfo[] {
    const idSet = new Set(idList);
    const result: FigmaFrameInfo[] = [];

    const findNodes = (nodes: FigmaFrameInfo[]) => {
        for (const node of nodes) {
            if (idSet.has(node.id)) {
                // Deep clone the node to ensure all fields (including url) are preserved
                const clonedNode = JSON.parse(JSON.stringify(node)) as FigmaFrameInfo;
                result.push(clonedNode);
                // Do not recurse into children of a match, because the match already contains them.
            } else if (node.children && Array.isArray(node.children)) {
                findNodes(node.children);
            }
        }
    };

    const nodeArray = Array.isArray(tree) ? tree : [tree];
    findNodes(nodeArray);
    return result;
}

/**
 * Extract nodes by IDs while preserving hierarchical structure
 * Nodes in idList are kept; if a deep child is in idList but parent isn't, the child is still extracted
 *
 * @param tree - The Figma frame tree to search
 * @param idList - Array of node IDs to extract
 * @param options - Optional settings
 * @param options.includeSubtree - If true, includes all descendants of matched nodes
 * @returns Array of extracted nodes with hierarchy preserved
 */
export function extractHierarchicalNodesByIds(
    tree: FigmaFrameInfo | FigmaFrameInfo[],
    idList: string[],
    options?: { includeSubtree?: boolean }
): FigmaFrameInfo[] {
    if (options?.includeSubtree) {
        return extractNodesWithSubtreeByIds(tree, idList);
    }

    const idSet = new Set(idList);
    const result: FigmaFrameInfo[] = [];

    // Helper function to check if a node or any of its descendants are in idList
    const hasDescendantInList = (node: FigmaFrameInfo): boolean => {
        if (idSet.has(node.id)) return true;

        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                if (typeof child === 'object' && child !== null && 'id' in child) {
                    if (hasDescendantInList(child)) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    // Helper function to recursively process a single node
    const processNode = (node: FigmaFrameInfo): FigmaFrameInfo[] => {
        // First check if this node or any descendant is in the list
        if (!hasDescendantInList(node)) {
            return [];
        }

        // If current node is in the list, keep it with filtered children
        if (idSet.has(node.id)) {
            const clonedNode: FigmaFrameInfo = { ...node };

            // Process children if they exist
            if (node.children && Array.isArray(node.children)) {
                const filteredChildren: FigmaFrameInfo[] = [];

                for (const child of node.children) {
                    if (typeof child === 'object' && child !== null && 'id' in child) {
                        const processedChildren = processNode(child);
                        filteredChildren.push(...processedChildren);
                    }
                }

                clonedNode.children = filteredChildren.length > 0 ? filteredChildren : [];
            } else {
                clonedNode.children = [];
            }

            return [clonedNode];
        } else {
            // Current node is not in the list, but some descendants are
            // Collect all matching descendants and return them (flattened)
            const matchingDescendants: FigmaFrameInfo[] = [];

            if (node.children && Array.isArray(node.children)) {
                for (const child of node.children) {
                    if (typeof child === 'object' && child !== null && 'id' in child) {
                        const processedChildren = processNode(child);
                        matchingDescendants.push(...processedChildren);
                    }
                }
            }

            return matchingDescendants;
        }
    };

    // Process tree (handle both single node and array)
    const nodeArray = Array.isArray(tree) ? tree : [tree];

    for (const node of nodeArray) {
        const processedNodes = processNode(node);
        result.push(...processedNodes);
    }

    return result;
}

// ============= Structure Processing Utilities =============

/**
 * Post-processes the structure tree in a single traversal
 * Performs three operations simultaneously:
 * 1. Normalizes componentName (moves from top-level to data field)
 * 2. Populates elements data from elementIds
 * 3. Annotates with file system paths (path, componentPath, kebabName)
 *
 * @param structure - The parsed structure from AI model
 * @param frames - The Figma frames tree for element extraction
 */
export function postProcessStructure(structure?: FrameStructNode | FrameStructNode[] | null, frames?: FigmaFrameInfo[]): void {
    if (!structure) {
        return;
    }

    // Utility to join path segments and normalize slashes
    const joinSegments = (...segments: (string | undefined)[]): string =>
        segments
            .filter((segment): segment is string => Boolean(segment && segment.length))
            .join('/')
            .replace(/\/{2,}/g, '/');

    const nodes = Array.isArray(structure) ? structure : [structure];
    let rootPath = '@/components';

    // Convert component name to kebab-case for file naming
    const toKebabName = (node: FrameStructNode): string => {
        const source = node.data.kebabName || node.data.name || node.id || 'component';
        const kebabName = toKebabCase(source);
        if (!node.data.kebabName) {
            node.data.kebabName = kebabName;
        }
        return kebabName;
    };

    const traverse = (node?: FrameStructNode | null, parentPath?: string, level = 0): void => {
        if (!node || !node.data) {
            return;
        }

        // 1. Normalize componentName (from top-level to data field)
        const extendedNode = node as ExtendedFrameStructNode;
        const topLevelComponentName = extendedNode.componentName;
        if (topLevelComponentName && !node.data.componentName) {
            node.data.componentName = topLevelComponentName;
            delete extendedNode.componentName;
        }

        // 2. Populate elements data from elementIds
        if (frames) {
            const nodeData = node.data as FrameData & { elementIds?: string[] };
            const elementIds = nodeData.elementIds;
            if (elementIds && Array.isArray(elementIds)) {
                if (elementIds.length > 0) {
                    node.data.elements = extractHierarchicalNodesByIds(frames, elementIds, { includeSubtree: true });
                } else {
                    node.data.elements = [];
                }
                delete nodeData.elementIds;
            } else {
                node.data.elements = node.data.elements || [];
            }
        }

        // 3. Annotate with file system paths
        const segment = toKebabName(node);
        let currentPath: string;

        if (level === 0) {
            // Root node always uses base path
            currentPath = rootPath;
            rootPath = currentPath;
        } else {
            const ancestorPath = parentPath || rootPath;
            currentPath = joinSegments(ancestorPath, segment);
        }

        // For reusable components, generate flat componentPath (non-hierarchical)
        if (node.data.componentName) {
            const componentKebabName = toKebabCase(node.data.componentName);
            node.data.componentPath = joinSegments(rootPath, componentKebabName);
            node.data.path = node.data.componentPath;
        }

        node.data.path = currentPath;

        // Recursively process children
        if (Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach(child => traverse(child, node.data.path, level + 1));
        }
    };

    nodes.forEach(node => {
        if (!node || !node.data) {
            return;
        }
        traverse(node, undefined, 0);
    });
}

/**
 * Extracts component properties and states from repeated component instances
 * For components that appear multiple times (e.g., cards in a grid), this function:
 * 1. Groups instances by componentName
 * 2. Uses AI to extract data variations (text, images, etc.)
 * 3. Generates props schema for the component
 * 4. Collapses duplicate instances into a single template + state array
 *
 * @param node - Current structure node to process
 * @param frames - Figma frames for reference
 * @param thumbnailUrl - Design thumbnail URL for AI visual context
 */
export async function populateComponentProps(node: FrameStructNode, frames: FigmaFrameInfo[], thumbnailUrl?: string): Promise<void> {
    if (!node || !node.children || node.children.length === 0) return;

    const componentGroups = new Map<string, FrameStructNode[]>();
    const validChildren = node.children.filter(c => c && c.data);

    validChildren.forEach(child => {
        const name = child.data.componentName;
        if (name) {
            if (!componentGroups.has(name)) {
                componentGroups.set(name, []);
            }
            componentGroups.get(name)!.push(child);
        }
    });

    // Process each component group to extract props and data
    for (const [compName, group] of componentGroups) {
        if (group.length === 0) continue;

        const isList = group.length > 1;
        const allElements = group.flatMap(g => g.data.elements || []);
        const simplifiedNodes = allElements
            .filter((n): n is FigmaFrameInfo => typeof n === 'object' && n !== null)
            .map(n => simplifyFigmaNodeForContent(n));
        const figmaDataJson = JSON.stringify(simplifiedNodes);
        const containerName = node.data.name || 'Container';

        try {
            const { extractDataListPrompt } = await import('./prompt');
            const prompt = extractDataListPrompt({
                containerName,
                childComponentName: compName,
                figmaData: figmaDataJson,
            });

            const result = await callModel({
                question: prompt,
                imageUrls: thumbnailUrl,
                responseFormat: { type: 'json_object' },
            });

            const json = extractJSON(result);
            const parsed = JSON.parse(json) as ParsedDataListResponse;

            if (parsed && parsed.state && Array.isArray(parsed.state)) {
                if (isList) {
                    if (!node.data.states) {
                        node.data.states = [];
                    }

                    node.data.states.push({
                        state: parsed.state,
                        componentName: compName,
                        componentPath: group[0]?.data.componentPath || '',
                    });

                    const originalChildren: FrameStructNode[] = node.children || [];
                    const newChildren: FrameStructNode[] = [];
                    const processedComponentNames = new Set<string>();

                    for (const child of originalChildren) {
                        const childName = child.data.componentName;
                        if (childName === compName) {
                            if (!processedComponentNames.has(childName)) {
                                child.data.name = childName;
                                child.id = childName;
                                const cleanKebabName = toKebabCase(childName);
                                child.data.kebabName = cleanKebabName;
                                delete child.data.path;

                                if (parsed.props && Array.isArray(parsed.props)) {
                                    child.data.props = parsed.props;
                                }

                                newChildren.push(child);
                                processedComponentNames.add(childName);
                            }
                        } else {
                            newChildren.push(child);
                        }
                    }

                    node.children = newChildren;
                }
            }
        } catch (e) {
            logger.printErrorLog(
                `Failed to extract data list for ${compName} in ${containerName}: ${e instanceof Error ? e.message : String(e)}`
            );
        }
    }

    // Recursively process children
    for (const child of node.children) {
        await populateComponentProps(child, frames, thumbnailUrl);
    }
}
