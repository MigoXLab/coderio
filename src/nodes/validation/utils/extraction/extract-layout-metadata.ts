/**
 * Figma layout metadata extraction utilities.
 *
 * Extracts layout-related metadata from ValidationContext for agent reasoning.
 */

import type { FigmaLayoutMetadata } from '../../types';
import type { ValidationContext, ElementInfo } from '../../../../types/validation-types';

/** Layout quality scores for different node types */
const LAYOUT_SCORES = {
    FRAME_WITH_LAYOUT: 4,
    NODE_WITH_LAYOUT: 3,
    GROUP: 2,
    DEFAULT: 1,
} as const;

function hasLayoutMode(element: ElementInfo): boolean {
    return element.layoutMode !== 'NONE' && element.layoutMode !== undefined;
}

function getLayoutScore(element: ElementInfo): number {
    if (element.type === 'FRAME' && hasLayoutMode(element)) {
        return LAYOUT_SCORES.FRAME_WITH_LAYOUT;
    }
    if (hasLayoutMode(element)) {
        return LAYOUT_SCORES.NODE_WITH_LAYOUT;
    }
    if (element.type === 'GROUP') {
        return LAYOUT_SCORES.GROUP;
    }
    return LAYOUT_SCORES.DEFAULT;
}

function findBestLayoutElement(elementIds: string[], context: ValidationContext): ElementInfo | undefined {
    let bestElement: ElementInfo | undefined;
    let bestScore = -1;

    for (const elemId of elementIds) {
        const element = context.elements.get(elemId);
        if (!element) continue;

        const score = getLayoutScore(element);
        if (score > bestScore) {
            bestScore = score;
            bestElement = element;
            if (score === LAYOUT_SCORES.FRAME_WITH_LAYOUT) break;
        }
    }

    return bestElement;
}

/**
 * Extract layout metadata from ValidationContext for a specific component.
 *
 * @param context - Unified validation context
 * @param _componentId - Target component ID (unused, kept for API compatibility)
 * @param elementIds - Pre-extracted element IDs for this component
 */
export function extractLayoutFromContext(context: ValidationContext, _componentId: string, elementIds: string[]): FigmaLayoutMetadata {
    // Find best layout element from element IDs
    const element = elementIds.length > 0 ? findBestLayoutElement(elementIds, context) : undefined;

    if (!element) {
        return {
            layoutMode: 'NONE',
            primaryAxisAlignItems: 'N/A',
            counterAxisAlignItems: 'N/A',
            itemSpacing: 0,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            constraints: {},
            absoluteBoundingBox: {},
        };
    }

    return {
        layoutMode: element.layoutMode ?? 'NONE',
        primaryAxisAlignItems: element.primaryAxisAlignItems ?? 'N/A',
        counterAxisAlignItems: element.counterAxisAlignItems ?? 'N/A',
        itemSpacing: element.itemSpacing ?? 0,
        padding: {
            top: element.paddingTop ?? 0,
            right: element.paddingRight ?? 0,
            bottom: element.paddingBottom ?? 0,
            left: element.paddingLeft ?? 0,
        },
        constraints: element.constraints ?? {},
        absoluteBoundingBox: {
            x: element.position.x,
            y: element.position.y,
            width: element.position.w,
            height: element.position.h,
        },
    };
}

// Keep backward-compatible export for any remaining usages
export { extractLayoutFromContext as extractFigmaLayoutMetadata };
