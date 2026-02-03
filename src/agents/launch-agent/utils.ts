/**
 * Utility functions for Launch Agent.
 */

import type { LaunchAgentResult } from './types';

/**
 * Extract launch result from agent response.
 * @param response - Agent response text (with TaskCompletion tags already stripped by evoltagent)
 * @returns Parsed LaunchAgentResult object
 */
export function parseLaunchResult(response: string): Promise<LaunchAgentResult> {
    // Check for empty response
    if (!response || response.trim().length === 0) {
        throw new Error('Agent returned empty response');
    }

    // Extract JSON from markdown code block
    // The evoltagent library strips <TaskCompletion> tags before calling postProcessor
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
        throw new Error('No JSON code block found in agent response');
    }

    const jsonStr = jsonMatch[1];

    if (!jsonStr || jsonStr.trim().length === 0) {
        throw new Error('Empty JSON content in code block');
    }

    const parsed = JSON.parse(jsonStr) as LaunchAgentResult;

    // Validate required fields if success is true
    if (parsed.success === true && (!parsed.serverKey || !parsed.url || !parsed.port)) {
        throw new Error('Agent returned success=true but missing required fields');
    }

    return Promise.resolve(parsed);
}
