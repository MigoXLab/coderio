export interface GitCommitOptions {
    /**
     * Absolute path to the git repository to commit.
     * Defaults to the generated app directory.
     */
    repoPath?: string;

    /**
     * Optional commit message "suffix".
     * If provided, the agent MUST commit with:
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

export interface GitCommitResult {
    success: boolean;
    message: string;
}
