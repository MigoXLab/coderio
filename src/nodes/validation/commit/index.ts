import { createCommitAgent } from '../../../agents/commit-agent';
import { formatGitCommitInstruction } from '../../../agents/commit-agent/instruction';
import { logger } from '../../../utils/logger';
import type { GitCommitOptions, GitCommitResult } from '../types';
import path from 'path';

/**
 * Public API: commit changes using commit agent.
 * Delegates to the commit-agent, passing appPath via instruction.
 */
export async function commit(options?: GitCommitOptions): Promise<GitCommitResult> {
    try {
        if (!options?.appPath) {
            throw new Error('commit() requires options.appPath');
        }

        const appPath = path.resolve(options.appPath);
        const agent = createCommitAgent();

        const instruction = formatGitCommitInstruction({
            appPath,
            iteration: options.iteration,
        });

        await agent.run(instruction);

        logger.printSuccessLog('Commit completed!');
        return {
            success: true,
            message: 'Commit workflow completed',
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`Commit failed: ${errorMessage}`);
        return {
            success: false,
            message: errorMessage,
        };
    }
}
