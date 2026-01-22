export function launchAgentInstruction(params: { appPath: string }): string {
    return `appPath: ${params.appPath}

TASK:
Install dependencies, compile the project, fix any compilation errors, start the development server, and fix any runtime errors. The goal is to have a fully working, error-free project.`;
}
