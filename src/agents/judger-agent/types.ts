/**
 * Types owned by JudgerAgent.
 */

/**
 * Judger agent output schema
 * Represents the diagnosis from the JudgerAgent analyzing layout errors
 */
export interface JudgerDiagnosis {
    errorType: 'pixel_misalignment' | 'positioning_strategy' | 'layout_direction';
    rootCause: string;
    visualEvidence: string;
    codeEvidence: string;
    refineInstructions: string[];
    toolsUsed: string[];
}

/**
 * Component history entry
 * Tracks position and fix across iterations for HistoryTool
 */
export interface ComponentHistoryEntry {
    iteration: number;
    position: [number, number];
    error: [number, number];
    fixApplied: string[] | null;
}

/**
 * Component history map
 * Maps component IDs to their history entries
 */
export type ComponentHistory = Record<string, ComponentHistoryEntry[]>;
