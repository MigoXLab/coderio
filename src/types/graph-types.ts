/* Enum representing the nodes in the LangGraph. */
export enum GraphNode {
    INITIAL = 'initial',
    PROCESS = 'process',
    VALIDATION = 'validation',
    DATA = 'data',
    CODE = 'code',
}

export interface GlobalFigmaInfo {
    thumbnail: string;
}

/**
 * Graph-level configuration.
 * Contains configuration for various nodes in the workflow.
 */
export interface GraphConfig {
    /**
     * Validation execution mode.
     * - reportOnly: run a single validation pass and generate a report (no code edits)
     * - full: run iterative actor-critic refinement loop (may edit code + commit markers)
     */
    validationMode?: 'reportOnly' | 'full';
}
