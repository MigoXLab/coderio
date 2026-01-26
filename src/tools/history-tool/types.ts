/**
 * Types for HistoryTool.
 *
 * Kept standalone to keep `index.ts` focused on behavior.
 */
export interface IterationSummaryChange {
    componentId: string;
    position: [number, number];
    error: [number, number];
    fixApplied: string[];
}
