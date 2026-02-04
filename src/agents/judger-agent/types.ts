/**
 * Types owned by JudgerAgent.
 */

/**
 * Judger agent output schema
 * Represents the diagnosis from the JudgerAgent analyzing layout errors
 */
export interface JudgerDiagnosis {
    errorType: 'pixel_misalignment' | 'positioning_strategy' | 'parent_spacing' | 'sibling_cascade' | 'empty_response';
    rootCause: string;
    visualEvidence: string;
    codeEvidence: string;
    refineInstructions: string[];
    toolsUsed: string[];
}
