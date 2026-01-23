import { createLaunchAgent } from '../../../../agents/launch-agent';
import { launchAgentInstruction } from '../../../../agents/launch-agent/instruction';

export const launch = async (appPath: string) => {
    if (!appPath) {
        throw new Error('appPath is required');
    }

    try {
        await createLaunchAgent().run(launchAgentInstruction({ appPath }));
        return {
            success: true,
            message: 'Launch and quality assurance completed',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
};
