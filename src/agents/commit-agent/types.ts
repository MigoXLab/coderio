/**
 * Types owned by CommitAgent.
 */

/**
 * Parameters for commit agent instruction.
 * Used to specify the app directory and commit details.
 */
export interface CommitAgentParams {
    /**
     * Absolute path to the app directory to commit.
     */
    appPath: string;

    /**
     * Current iteration number (optional).
     * If provided: generates iteration-based commit message
     * If undefined: treats as initial commit
     */
    iteration?: number;
}
