/**
 * Types owned by CommitAgent.
 */

/**
 * Parameters for commit agent instruction.
 * Used to specify the git repository and commit details.
 */
export interface CommitAgentParams {
    /**
     * Absolute path to the git repository to commit.
     */
    repoPath: string;

    /**
     * Optional commit message "suffix".
     * If provided, the agent will commit with:
     *   "Commit by CodeRio - ${commitMessage}"
     *
     * Example: "start iteration 1"
     */
    commitMessage?: string;

    /**
     * Whether to allow empty commits.
     * Useful for creating deterministic marker commits (e.g. iteration boundaries).
     */
    allowEmpty?: boolean;
}
