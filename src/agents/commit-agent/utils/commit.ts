import * as path from 'path';

import type { Agent, ModelResponse } from 'evoltagent';

import { formatGitCommitInstruction } from '../commit-instruction';
import type { GitCommitOptions, GitCommitResult } from '../types';
import { ensureGitignore } from './ensure-gitignore';

export function resolveRepoPath(options: GitCommitOptions = {}): string {
    if (!options.repoPath) {
        throw new Error('commitWithAgent() requires options.repoPath in coderio.');
    }
    return path.resolve(options.repoPath);
}

export async function runGitCommit(
    agent: Agent,
    params: { repoPath: string; commitMessage?: string; allowEmpty?: boolean }
): Promise<ModelResponse[]> {
    const instruction = formatGitCommitInstruction(params);

    // evoltagent's Agent.run() is typed as `any`; cast to our expected response type to satisfy ESLint.
    return (await agent.run(instruction)) as ModelResponse[];
}

export async function commitWithAgent(agent: Agent, options: GitCommitOptions = {}): Promise<GitCommitResult> {
    const repoPath = resolveRepoPath(options);
    try {
        ensureGitignore(repoPath);
        await runGitCommit(agent, {
            repoPath,
            commitMessage: options.commitMessage,
            allowEmpty: options.allowEmpty,
        });

        return {
            success: true,
            message: 'Commit workflow completed',
        };
    } catch (error) {
        const errorMsg = `Commit failed: ${error instanceof Error ? error.message : String(error)}`;
        return {
            success: false,
            message: errorMsg,
        };
    }
}

