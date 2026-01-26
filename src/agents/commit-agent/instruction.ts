import type { CommitAgentParams } from './types';

export function formatGitCommitInstruction(params: CommitAgentParams): string {
    const { repoPath, iteration } = params;

    return `repoPath: ${repoPath}
iteration: ${iteration ?? 'undefined'}

TASK:
Check for changes and commit if there are any modifications in the repository.`;
}
