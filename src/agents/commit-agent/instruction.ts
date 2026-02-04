import type { CommitAgentParams } from './types';

export function formatGitCommitInstruction(params: CommitAgentParams): string {
    const { appPath, iteration } = params;

    return `appPath: ${appPath}
iteration: ${iteration ?? 'undefined'}

TASK:
Check for changes and commit if there are any modifications in the app directory.`;
}
