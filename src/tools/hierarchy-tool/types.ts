/**
 * Types for HierarchyTool.
 *
 * Kept standalone to keep `index.ts` focused on behavior.
 */

import type { Dict } from '../../nodes/validation/types';

export type HierarchyNode = Dict;

export type ComponentPaths = Record<string, string>;

export interface ParentInfo {
    id: string;
}
