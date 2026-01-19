/**
 * Types owned by RefinerAgent.
 */

/**
 * Refiner agent output schema
 * Represents the result from the RefinerAgent applying code fixes
 */
export interface RefinerResult {
    success: boolean;
    summary: string[];
    editsApplied: number;
    error?: string;
}

