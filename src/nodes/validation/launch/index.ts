import { createLaunchAgent, launchAgentInstruction, type LaunchAgentResult } from '../../../agents/launch-agent';

export interface LaunchResult {
    success: boolean;
    message?: string;
    error?: string;
    // Server metadata from LaunchTool
    serverKey?: string;
    url?: string;
    port?: number;
}

export const launch = async (appPath: string): Promise<LaunchResult> => {
    if (!appPath) {
        throw new Error('appPath is required');
    }

    try {
        // Agent.run() returns the parsed LaunchAgentResult via postProcessor
        const agentResult = (await createLaunchAgent().run(launchAgentInstruction({ appPath }))) as LaunchAgentResult;

        // If agent explicitly failed, return the error
        if (agentResult.success === false) {
            return {
                success: false,
                error: agentResult.error ?? 'Launch agent failed without error message',
            };
        }

        // postProcessor already validates serverKey, url, port are present when success=true
        // So we can safely return them here
        return {
            success: true,
            message: agentResult.message ?? 'Launch and quality assurance completed',
            serverKey: agentResult.serverKey,
            url: agentResult.url,
            port: agentResult.port,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
};
