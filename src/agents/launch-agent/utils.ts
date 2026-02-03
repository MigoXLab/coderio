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
    // Check for empty response
    if (!response || response.trim().length === 0) {
        logger.printInfoLog('Launch agent returned empty response');
        return Promise.resolve({
            success: false,
            error: 'Agent returned empty response',
        });
    }

    // Extract JSON from markdown code block
    // The evoltagent library strips <TaskCompletion> tags before calling postProcessor
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
        logger.printInfoLog('Launch agent response missing JSON block');
        return Promise.resolve({
            success: false,
            error: 'No JSON code block found in agent response',
        });
    }

    const jsonStr = jsonMatch[1];

    if (!jsonStr || jsonStr.trim().length === 0) {
        logger.printInfoLog('Launch agent response has empty JSON');
        return Promise.resolve({
            success: false,
            error: 'Empty JSON content in code block',
        });
    }

    try {
        const parsed = JSON.parse(jsonStr) as LaunchAgentResult;

        // Validate required fields if success is true
        if (parsed.success === true && (!parsed.serverKey || !parsed.url || !parsed.port)) {
            logger.printInfoLog('Launch agent success response missing required fields');
            return Promise.resolve({
                success: false,
                error: 'Missing required fields (serverKey, url, or port)',
            });
        }

        return Promise.resolve(parsed);
    } catch (error) {
        logger.printInfoLog(`Launch agent response JSON parse failed: ${error instanceof Error ? error.message : String(error)}`);
        return Promise.resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
