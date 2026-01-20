/**
 * Figma layout metadata extraction utilities.
 *
 * Extracts layout-related metadata from Figma JSON for agent reasoning.
 */

import type { FigmaLayoutMetadata } from '../../types';
import { findInTree, type Dict } from '../tree/tree-traversal';

/** Layout quality scores for different node types */
const LAYOUT_SCORES = {
    FRAME_WITH_LAYOUT: 4,
    NODE_WITH_LAYOUT: 3,
    GROUP: 2,
    DEFAULT: 1,
} as const;

function hasLayoutMode(node: Dict): boolean {
    return node.layoutMode !== 'NONE' && node.layoutMode !== undefined;
}

function getLayoutScore(node: Dict): number {
    if (node.type === 'FRAME' && hasLayoutMode(node)) {
        return LAYOUT_SCORES.FRAME_WITH_LAYOUT;
    }
    if (hasLayoutMode(node)) {
        return LAYOUT_SCORES.NODE_WITH_LAYOUT;
    }
    if (node.type === 'GROUP') {
        return LAYOUT_SCORES.GROUP;
    }
    return LAYOUT_SCORES.DEFAULT;
}

function searchForLayoutInChildren(node: Dict): Dict | undefined {
    const children = (node.children as Dict[]) || [];

    for (const child of children) {
        if (child.type === 'FRAME' && hasLayoutMode(child)) {
            return child;
        }
    }

    for (const child of children) {
        const result = searchForLayoutInChildren(child);
        if (result) {
            return result;
        }
    }

    return undefined;
}

function findBestLayoutNode(elementIds: string[], figmaJson: Dict): Dict | undefined {
    let bestNode: Dict | undefined;
    let bestScore = -1;

    for (const elemId of elementIds) {
        const node = findInTree(figmaJson, elemId);
        if (!node) continue;

        const score = getLayoutScore(node);
        if (score > bestScore) {
            bestScore = score;
            bestNode = node;
            if (score === LAYOUT_SCORES.FRAME_WITH_LAYOUT) break;
        }
    }

    if (bestNode && bestNode.type === 'GROUP' && bestScore === LAYOUT_SCORES.GROUP) {
        const layoutChild = searchForLayoutInChildren(bestNode);
        if (layoutChild) {
            return layoutChild;
        }
    }

    return bestNode;
}

/**
 * Extract layout metadata for a specific component from Figma JSON.
 *
 * @param figmaJson - Complete Figma design data
 * @param componentId - Target component ID (from structure tree)
 * @param elementIds - Pre-extracted element IDs for this component (from element registry)
 */
export function extractFigmaLayoutMetadata(figmaJson: Dict, componentId: string, elementIds: string[]): FigmaLayoutMetadata {
    let node: Dict | undefined;

    // Try direct lookup in figmaJson.nodes
    const nodes = figmaJson.nodes as Record<string, Dict> | undefined;
    node = nodes?.[componentId];

    // If not found, find best layout node from element IDs
    if (!node && elementIds.length > 0) {
        node = findBestLayoutNode(elementIds, figmaJson);
    }

    // Final fallback: generic tree search
    if (!node) {
        node = findInTree(figmaJson, componentId) || {};
    }

    const bbox = (node.absoluteBoundingBox as Dict) || {};

    return {
        layoutMode: (node.layoutMode as string) || 'NONE',
        primaryAxisAlignItems: (node.primaryAxisAlignItems as string) || 'N/A',
        counterAxisAlignItems: (node.counterAxisAlignItems as string) || 'N/A',
        itemSpacing: (node.itemSpacing as number) || 0,
        padding: {
            top: (node.paddingTop as number) || 0,
            right: (node.paddingRight as number) || 0,
            bottom: (node.paddingBottom as number) || 0,
            left: (node.paddingLeft as number) || 0,
        },
        constraints: (node.constraints as Record<string, unknown>) || {},
        absoluteBoundingBox: {
            x: bbox.x as number | undefined,
            y: bbox.y as number | undefined,
            width: bbox.width as number | undefined,
            height: bbox.height as number | undefined,
        },
    };
}
