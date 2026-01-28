/**
 * Utility functions for Launch Agent.
 */

import type { LaunchAgentResult } from './types';
import { logger } from '../../utils/logger';

/**
 * Extract launch result from agent response.
 * @param response - Agent response text (with TaskCompletion tags already stripped by evoltagent)
 * @returns Parsed LaunchAgentResult object
 */
export function parseLaunchResult(response: string): Promise<LaunchAgentResult> {
    try {
        // Check for empty response
        if (!response || response.trim().length === 0) {
            logger.printErrorLog(`[LaunchAgent] Agent returned empty response`);
            logger.printErrorLog(`This usually means:`);
            logger.printErrorLog(`  1. Agent made tool calls but never generated final output`);
            logger.printErrorLog(`  2. Context window exhausted after tool results added`);
            logger.printErrorLog(`  3. Model timeout or API error`);
            logger.printErrorLog(`  4. Max output tokens too small for response`);
            throw new Error('Agent returned empty response after tool execution');
        }

        // Extract JSON from markdown code block
        // The evoltagent library strips <TaskCompletion> tags before calling postProcessor
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

        if (!jsonMatch) {
            logger.printErrorLog(`[LaunchAgent] No JSON code block found in response`);
            logger.printErrorLog(`Response preview (first 500 chars):\n${response.substring(0, 500)}`);
            if (response.length > 500) {
                logger.printErrorLog(`Last 500 chars:\n${response.substring(Math.max(0, response.length - 500))}`);
            }
            throw new Error('No JSON code block found in agent response. Expected format: ```json\\n{...}\\n```');
        }

        const jsonStr = jsonMatch[1];

        if (!jsonStr || jsonStr.trim().length === 0) {
            logger.printErrorLog(`[LaunchAgent] Empty JSON content in code block`);
            throw new Error('Empty JSON content in code block');
        }

        const parsed = JSON.parse(jsonStr) as LaunchAgentResult;

        // Validate required fields if success is true
        if (parsed.success === true && (!parsed.serverKey || !parsed.url || !parsed.port)) {
            logger.printErrorLog(`[LaunchAgent] Success response missing required fields`);
            logger.printErrorLog(`Parsed result: ${JSON.stringify(parsed, null, 2)}`);
            throw new Error('Agent returned success=true but missing serverKey, url, or port');
        }

        return Promise.resolve(parsed);
    } catch (error) {
        // Provide detailed error context for debugging
        logger.printErrorLog(`[LaunchAgent] Failed to parse launch result JSON`);
        logger.printErrorLog(`Response length: ${response.length} characters`);

        if (error instanceof Error) {
            throw new Error(`Post-processor failed: ${error.message}`);
        }
        throw new Error(`Post-processor failed: ${String(error)}`);
    }
}
