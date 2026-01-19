import type { GitCommitOptions, GitCommitResult } from '../../types';
import { commit as commitWithAgent } from '../../../../agents/commit-agent';
import { logger } from '../../../../utils/logger';

export type { GitCommitOptions, GitCommitResult };

/**
 * Public API: commit changes using commit agent.
 * Delegates to the commit-agent's commit implementation.
 */
export async function commit(options?: GitCommitOptions): Promise<GitCommitResult> {
    try {
        const result = await commitWithAgent(options);

        if (result.success) {
            logger.printSuccessLog('✅ Commit completed!');
            return result;
        }

        logger.printErrorLog(`❌ Commit failed: ${result.message}`);
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`Error running commit: ${errorMessage}`);
        return {
            success: false,
            message: errorMessage,
        };
    }
}

