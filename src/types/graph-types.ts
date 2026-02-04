/* Enum representing the nodes in the LangGraph. */
export enum GraphNode {
    INITIAL = 'initial',
    PROCESS = 'process',
    VALIDATION = 'validation',
    DATA = 'data',
    CODE = 'code',
}

export enum ValidationMode {
    CodeOnly = 'codeOnly',
    ReportOnly = 'reportOnly',
    Full = 'full',
}

export interface GlobalFigmaInfo {
    thumbnail: string;
}

/**
 * Validation-specific configuration.
 * Controls validation behavior in the workflow.
 */
export interface ValidationConfig {
    /**
     * Validation execution mode.
     * - codeOnly: generate component code without validation (only commit)
     * - reportOnly: run a single validation pass and generate a report (no code edits)
     * - full: run iterative actor-critic refinement loop (may edit code + commit markers)
     */
    validationMode?: ValidationMode;
}
