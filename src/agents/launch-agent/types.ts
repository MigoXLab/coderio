export interface LaunchOptions {
    /**
     * Absolute path to the app repository to launch.
     * Defaults to the generated app directory.
     */
    repoPath?: string;

    /**
     * Launch behavior mode.
     * - full: install + build + start dev server + runtime checks (default)
     * - buildOnly: install + build (+ LaunchAgent build fixes) only; do not start a dev server
     */
    mode?: 'buildOnly' | 'full';

    /**
     * Dev server command (e.g. "pnpm dev", "npm run dev").
     */
    runCommand?: string;

    /**
     * Build command (e.g. "pnpm build", "npm run build").
     */
    buildCommand?: string;

    /**
     * Model to use for build/runtime issue resolution and screenshot-based runtime checks.
     */
    model?: string;

    /**
     * Max number of build attempts (with LaunchAgent assistance when needed) before giving up.
     */
    maxBuildAttempts?: number;

    /**
     * Max number of runtime attempts (with LaunchAgent assistance when needed) before giving up.
     */
    maxRuntimeAttempts?: number;

    installTimeoutMs?: number;
    buildTimeoutMs?: number;
    serverStartTimeoutMs?: number;
    runtimeCheckTimeoutMs?: number;

    viewport?: { width: number; height: number };

    /**
     * Optional serverKey for reusing an existing dev server.
     * When provided with mode='buildOnly':
     * - Skips dependency installation
     * - Runs build validation
     * - Restarts the server with this key (picks up new code)
     * - Runs runtime diagnostics
     * Used by validation loop to check code after judger-refiner edits.
     */
    serverKey?: string;
}

export interface LaunchResult {
    success: boolean;
    repoPath: string;
    serverUrl?: string;
    port?: number;
    pid?: number;
    /** Server key for managed dev server (only set in full mode). Used to stop the server. */
    serverKey?: string;
    buildAgentIterations: number;
    runtimeAgentIterations: number;
    error?: string;
}

export type LaunchStage = 'build' | 'runtime';

export interface LaunchAgentResult {
    success: boolean;
    summary: string[];
    editsApplied: number;
    touchedFiles: string[];
    error?: string;
}
