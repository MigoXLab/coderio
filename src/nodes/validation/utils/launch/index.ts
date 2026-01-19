import { launchLoop } from './launch-loop';
import type { LaunchResult } from '../../types';
import { logger } from '../../../../utils/logger';

/**
 * Public API: launch dev server using launch agent.
 * Delegates to the launchLoop implementation.
 */
export async function launch(options?: Parameters<typeof launchLoop>[0]): Promise<LaunchResult> {
    try {
        const result = await launchLoop(options);

        if (result.success) {
            logger.printSuccessLog('╔════════════════════════════════════════════════════════╗');
            logger.printSuccessLog('║            🎉 LAUNCH SUCCESSFUL                       ║');
            logger.printSuccessLog('╚════════════════════════════════════════════════════════╝');
            logger.printLog(`📦 Build: ✅ Passed (${result.buildAgentIterations} agent iteration(s))`);
            if (result.serverUrl) {
                logger.printLog(`🚀 Runtime: ✅ Passed (${result.runtimeAgentIterations} agent iteration(s))`);
                logger.printLog(`🌐 Server: ${result.serverUrl} (port: ${result.port})`);
            } else {
                logger.printLog('🚀 Runtime: ⊘ Skipped (build-only mode)');
            }
            return result;
        }

        logger.printErrorLog('╔════════════════════════════════════════════════════════╗');
        logger.printErrorLog('║            ❌ LAUNCH FAILED                           ║');
        logger.printErrorLog('╚════════════════════════════════════════════════════════╝');
        logger.printLog(`📦 Build: ${result.buildAgentIterations > 0 ? `❌ Failed after ${result.buildAgentIterations} agent iteration(s)` : '❌ Failed'}`);
        logger.printLog(`🚀 Runtime: ${result.runtimeAgentIterations > 0 ? `❌ Failed after ${result.runtimeAgentIterations} agent iteration(s)` : '⊘ Not reached'}`);
        logger.printErrorLog('\n💬 Error Details:');
        logger.printErrorLog(result.error || 'Unknown error');
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog('╔════════════════════════════════════════════════════════╗');
        logger.printErrorLog('║       ⚠️  LAUNCH CRASHED UNEXPECTEDLY                 ║');
        logger.printErrorLog('╚════════════════════════════════════════════════════════╝');
        logger.printErrorLog(`💬 Error: ${errorMessage}`);
        return {
            success: false,
            error: errorMessage,
            repoPath: options?.repoPath ?? '',
            buildAgentIterations: 0,
            runtimeAgentIterations: 0,
        };
    }
}

export { launchLoop };

