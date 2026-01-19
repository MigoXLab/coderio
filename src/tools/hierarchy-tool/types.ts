/**
 * Types for HierarchyTool.
 *
 * Kept standalone to keep `index.ts` focused on behavior.
 */

import type { Dict } from '../../nodes/validation/utils/general/tree-traversal';

export type HierarchyNode = Dict;

export type ComponentPaths = Record<string, string>;

export interface ParentInfo {
    id: string;
}

