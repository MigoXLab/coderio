export function formatGitCommitInstruction(params: {
    repoPath: string;
    commitMessage?: string;
    allowEmpty?: boolean;
}): string {
    const commitMessage = (params.commitMessage ?? '').trim();
    const allowEmpty = params.allowEmpty ?? false;

    return `repoPath: ${params.repoPath}
commitMessage: ${commitMessage}
allowEmpty: ${allowEmpty}

TASK:
Commit local changes in the repository at repoPath.`;
}
