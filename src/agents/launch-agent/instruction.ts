import type { LaunchAgentParams } from './types';

export function launchAgentInstruction(params: LaunchAgentParams): string {
    return `appPath: ${params.appPath}

TASK:
Install dependencies, compile the project, fix any compilation errors, start the development server, and fix any runtime errors. The goal is to have a fully working, error-free project.`;
}
