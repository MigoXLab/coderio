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
