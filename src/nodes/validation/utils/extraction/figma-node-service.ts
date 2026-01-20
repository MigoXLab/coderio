/**
 * Validation-owned Figma node utilities.
 *
 * Keep this minimal and focused on validation/position capture needs.
 */

import type { FigmaFrameInfo } from '../../../../types/figma-types';

export type FigmaPosition = { x: number; y: number; w: number; h: number };

export class FigmaNodeService {
    private readonly nodeMap: Record<string, FigmaFrameInfo>;
    private positionCache?: Record<string, FigmaPosition | undefined>;

    constructor(tree: FigmaFrameInfo | FigmaFrameInfo[]) {
        this.nodeMap = FigmaNodeService.buildNodeMap(tree);
    }

    /**
     * Flat node map (id -> node)
     */
    getNodeMap(): Record<string, FigmaFrameInfo> {
        return this.nodeMap;
    }

    /**
     * Absolute positions extracted from the node map.
     */
    getNodePositions(): Record<string, FigmaPosition | undefined> {
        if (!this.positionCache) {
            this.positionCache = FigmaNodeService.extractNodePositions(this.nodeMap);
        }
        return this.positionCache;
    }

    static buildNodeMap(data: FigmaFrameInfo | FigmaFrameInfo[] | undefined): Record<string, FigmaFrameInfo> {
        const result: Record<string, FigmaFrameInfo> = {};
        if (!data) {
            return result;
        }

        const list = Array.isArray(data) ? data : [data];

        const visit = (node: FigmaFrameInfo): void => {
            if (!node.id) return;
            result[node.id] = node;

            if (node.children && Array.isArray(node.children)) {
                for (const child of node.children) {
                    visit(child);
                }
            }

            if (node.frames && Array.isArray(node.frames)) {
                for (const child of node.frames) {
                    visit(child);
                }
            }
        };

        for (const node of list) {
            visit(node);
        }

        return result;
    }

    /**
     * Extract node positions from a node map.
     * Prefer absoluteBoundingBox over absoluteRenderBounds.
     */
    static extractNodePositions(list: Record<string, FigmaFrameInfo>): Record<string, FigmaPosition | undefined> {
        return Object.fromEntries(
            Object.entries(list).map(([id, node]) => {
                const bounds = node.absoluteBoundingBox ?? node.absoluteRenderBounds;
                if (!bounds) {
                    return [id, undefined];
                }

                return [
                    id,
                    {
                        x: bounds.x,
                        y: bounds.y,
                        w: bounds.width,
                        h: bounds.height,
                    },
                ];
            })
        );
    }

    /**
     * Calculate design offset (min x/y across all valid positions).
     */
    static calculateDesignOffset(positions: Record<string, FigmaPosition | undefined>): { x: number; y: number } {
        let minX = Infinity;
        let minY = Infinity;

        for (const pos of Object.values(positions)) {
            if (!pos) continue;
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
        }

        if (minX === Infinity || minY === Infinity) {
            return { x: 0, y: 0 };
        }

        return { x: minX, y: minY };
    }

    /**
     * Normalize positions by subtracting an offset.
     */
    static normalizePositions(
        positions: Record<string, FigmaPosition | undefined>,
        offset: { x: number; y: number }
    ): Record<string, FigmaPosition | undefined> {
        const normalized: Record<string, FigmaPosition | undefined> = {};

        for (const [id, pos] of Object.entries(positions)) {
            if (!pos) {
                normalized[id] = undefined;
                continue;
            }

            normalized[id] = {
                x: pos.x - offset.x,
                y: pos.y - offset.y,
                w: pos.w,
                h: pos.h,
            };
        }

        return normalized;
    }
}
