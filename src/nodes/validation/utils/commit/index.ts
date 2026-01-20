import { createCommitAgent } from '../../../../agents/commit-agent';
import { formatGitCommitInstruction } from '../../../../agents/commit-agent/commit-instruction';
import { logger } from '../../../../utils/logger';
import type { GitCommitOptions, GitCommitResult } from '../../../../agents/commit-agent/types';
import path from 'path';

export type { GitCommitOptions, GitCommitResult };

/**
 * Public API: commit changes using commit agent.
 * Delegates to the commit-agent, passing repoPath via instruction.
 */
export async function commit(options?: GitCommitOptions): Promise<GitCommitResult> {
    try {
        if (!options?.repoPath) {
            throw new Error('commit() requires options.repoPath');
        }

        const repoPath = path.resolve(options.repoPath);
        const agent = createCommitAgent();

        const instruction = formatGitCommitInstruction({
            repoPath,
            commitMessage: options.commitMessage,
            allowEmpty: options.allowEmpty,
        });

        await agent.run(instruction);

        logger.printSuccessLog('✅ Commit completed!');
        return {
            success: true,
            message: 'Commit workflow completed',
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`❌ Commit failed: ${errorMessage}`);
        return {
            success: false,
            message: errorMessage,
        };
    }
}
