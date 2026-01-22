export function initialAgentInstruction(params: { appPath: string; appName: string }): string {
    return `
appPath: ${params.appPath}
appName: ${params.appName}

TASK:
Scaffold a clean React V18 + TS + Vite + TailwindCSS V4 + Less project.
`.trim();
}
