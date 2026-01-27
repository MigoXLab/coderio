/**
 * Types owned by LaunchAgent.
 */

/**
 * Parameters for launch agent instruction.
 * Specifies the project directory to launch.
 */
export interface LaunchAgentParams {
    /**
     * Absolute path to the app directory to launch.
     * The agent will install dependencies, build, and start the dev server.
     */
    appPath: string;
}

/**
 * Launch agent output schema.
 * Represents the result from the LaunchAgent after starting the dev server.
 */
export interface LaunchAgentResult {
    success: boolean;
    serverKey?: string;
    url?: string;
    port?: number;
    message?: string;
    error?: string;
}
