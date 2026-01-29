import type { LaunchAgentParams } from './types';

export function launchAgentInstruction(params: LaunchAgentParams): string {
    const skipNote = params.skipDependencyInstall ? '\n\nNOTE: Skip Step 1 (Install Dependencies). Dependencies already installed.' : '';

    return `appPath: ${params.appPath}${skipNote}

TASK:
Install dependencies, compile the project, fix any compilation errors, start the development server, and fix any runtime errors. The goal is to have a fully working, error-free project.`;
}
