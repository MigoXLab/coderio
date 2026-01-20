/**
 * Protocol Data Extraction Utilities
 *
 * Utilities for extracting Figma data from protocol structure.
 */

import type { FigmaFrameInfo, FigmaPositionAndSize, FrameStructNode } from '../../../../types/index.js';

/**
 * Extract complete Figma tree from protocol.data.elements.
 *
 * The protocol stores the full processed Figma tree in each node's data.elements.
 * This function reconstructs the root-level FigmaFrameInfo structure expected
 * by validation utilities.
 *
 * @param protocol - Protocol structure tree
 * @returns FigmaFrameInfo tree with absoluteBoundingBox data
 * @throws Error if protocol is missing required data
 *
 * @example
 * ```typescript
 * const figmaTree = extractFigmaTreeFromProtocol(protocol);
 * // Use figmaTree for validation coordinate normalization
 * ```
 */
export function extractFigmaTreeFromProtocol(protocol: FrameStructNode): FigmaFrameInfo {
    if (!protocol.data.elements || protocol.data.elements.length === 0) {
        throw new Error('Protocol data.elements is missing or empty. Cannot extract Figma tree.');
    }

    // Extract root-level elements (these are FigmaFrameInfo objects)
    const rootElements = protocol.data.elements as FigmaFrameInfo[];

    // Get root bounding box from protocol.data.layout or first element
    const rootBbox = protocol.data.layout?.boundingBox
        ? {
              x: protocol.data.layout.boundingBox.left,
              y: protocol.data.layout.boundingBox.top,
              width: protocol.data.layout.boundingBox.width,
              height: protocol.data.layout.boundingBox.height,
          }
        : rootElements[0]?.absoluteBoundingBox;

    if (!rootBbox) {
        throw new Error(
            'Cannot extract root bounding box from protocol. Missing both layout.boundingBox and elements[0].absoluteBoundingBox.'
        );
    }

    // Find thumbnailUrl from root elements (usually on first element or nested)
    const thumbnailUrl = findThumbnailUrl(rootElements);

    // Reconstruct FigmaFrameInfo structure matching expected format
    const figmaTree: FigmaFrameInfo = {
        id: protocol.id,
        name: protocol.data.name,
        type: 'FRAME',
        absoluteBoundingBox: rootBbox,
        frames: rootElements,
        children: rootElements,
        thumbnailUrl,
    };

    return figmaTree;
}

/**
 * Extract root absoluteBoundingBox for coordinate normalization.
 *
 * Used by validation utilities to calculate offset for normalizing
 * Figma coordinates to CSS coordinates.
 *
 * @param protocol - Protocol structure tree
 * @returns Root frame bounding box with x, y, width, height
 * @throws Error if no bounding box found in protocol
 *
 * @example
 * ```typescript
 * const rootBbox = extractRootBoundingBox(protocol);
 * const offsetX = rootBbox.x;
 * const offsetY = rootBbox.y;
 * ```
 */
export function extractRootBoundingBox(protocol: FrameStructNode): FigmaPositionAndSize {
    // First try: protocol.data.layout.boundingBox (pre-computed CSS coordinates)
    if (protocol.data.layout?.boundingBox) {
        return {
            x: protocol.data.layout.boundingBox.left,
            y: protocol.data.layout.boundingBox.top,
            width: protocol.data.layout.boundingBox.width,
            height: protocol.data.layout.boundingBox.height,
        };
    }

    // Second try: first element's absoluteBoundingBox (Figma coordinates)
    const firstElement = protocol.data.elements?.[0] as FigmaFrameInfo | undefined;
    if (firstElement?.absoluteBoundingBox) {
        return firstElement.absoluteBoundingBox;
    }

    // No bounding box found
    throw new Error('No bounding box found in protocol for root frame. Ensure protocol was generated with layout data.');
}

/**
 * Helper function to find thumbnailUrl in Figma tree.
 * Searches root level and first-level children for thumbnail.
 *
 * @param elements - Root elements from protocol
 * @returns Thumbnail URL or undefined
 */
function findThumbnailUrl(elements: FigmaFrameInfo[]): string | undefined {
    // Check root level
    for (const element of elements) {
        if (element.thumbnailUrl) {
            return element.thumbnailUrl;
        }
        // Check first-level children
        if (element.children) {
            for (const child of element.children) {
                if (child.thumbnailUrl) {
                    return child.thumbnailUrl;
                }
            }
        }
    }
    return undefined;
}
