/**
 * Types for HistoryTool.
 *
 * Kept standalone to keep `index.ts` focused on behavior.
 */

import type { ComponentHistory } from '../../nodes/validation/types';

export type { ComponentHistory };

export interface IterationSummaryChange {
    componentId: string;
    position: [number, number];
    error: [number, number];
    fixApplied: string[];
}
