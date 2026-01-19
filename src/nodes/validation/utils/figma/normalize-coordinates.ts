/**
 * Figma coordinate normalization utilities.
 *
 * Normalizes all `absoluteBoundingBox` coordinates so the Page frame becomes (0, 0).
 * This aligns coordinates with the Figma thumbnail origin.
 */

import { logger } from '../../../../utils/logger';
import { traverseTree, type Dict } from '../general/tree-traversal';

/** Type alias for coordinate positions */
type Position = [number, number];

/**
 * Collect all nodes with absoluteBoundingBox from both data formats.
 *
 * Supports both processedFigma.frames and legacy nodes format.
 */
function collectNodesWithBbox(figmaJson: Dict): Dict[] {
    const nodesWithBbox: Dict[] = [];

    const collectBboxNode = (node: Dict): void => {
        const bbox = node.absoluteBoundingBox as Dict | undefined;
        if (bbox && 'x' in bbox && 'y' in bbox) {
            nodesWithBbox.push(node);
        }
    };

    const processedFigma = figmaJson.processedFigma as Dict | undefined;

    // Collect Page frame itself (root bbox) as well.
    if (processedFigma) {
        collectBboxNode(processedFigma);
    }

    const frames = (processedFigma?.frames as Dict[] | undefined) ?? (processedFigma?.children as Dict[] | undefined) ?? [];
    for (const frame of frames) {
        traverseTree(frame, collectBboxNode);
    }

    const nodes = figmaJson.nodes as Record<string, Dict> | undefined;
    if (nodes) {
        for (const node of Object.values(nodes)) {
            if (node && typeof node === 'object') {
                collectBboxNode(node);
                if ('children' in node) {
                    traverseTree(node, collectBboxNode);
                }
            }
        }
    }

    return nodesWithBbox;
}

/**
 * Normalize all absoluteBoundingBox coordinates in figma_json in-place.
 *
 * Uses the Page frame's position (processedFigma.absoluteBoundingBox) as the offset,
 * NOT the minimum element position.
 *
 * Idempotent via `normalizedCache`.
 */
export function normalizeFigmaCoordinates(figmaJson: Dict, normalizedCache: Set<Dict>): Position {
    if (normalizedCache.has(figmaJson)) {
        logger.printTestLog('Coordinates already normalized, skipping');
        return [0.0, 0.0];
    }

    const processedFigma = figmaJson.processedFigma as Dict | undefined;
    const pageBbox = processedFigma?.absoluteBoundingBox as Dict | undefined;

    if (!pageBbox || !('x' in pageBbox) || !('y' in pageBbox)) {
        throw new Error('No Page frame bounding box found in processedFigma.absoluteBoundingBox');
    }

    const minX = pageBbox.x as number;
    const minY = pageBbox.y as number;
    logger.printTestLog(`Using Page frame position as offset: (${minX.toFixed(1)}, ${minY.toFixed(1)})`);

    if (Math.abs(minX) < 1 && Math.abs(minY) < 1) {
        logger.printTestLog(`Design offset (${minX.toFixed(2)}, ${minY.toFixed(2)}) is negligible, skipping normalization`);
        normalizedCache.add(figmaJson);
        return [minX, minY];
    }

    const nodesWithBbox = collectNodesWithBbox(figmaJson);

    for (const node of nodesWithBbox) {
        const bbox = node.absoluteBoundingBox as Dict;
        (bbox.x as number) -= minX;
        (bbox.y as number) -= minY;
    }

    normalizedCache.add(figmaJson);

    logger.printTestLog(`Normalized ${nodesWithBbox.length} nodes with Page frame offset (${minX.toFixed(1)}, ${minY.toFixed(1)})`);

    return [minX, minY];
}
