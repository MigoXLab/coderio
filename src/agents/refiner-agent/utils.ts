/**
 * Utility functions for Refiner Agent.
 */

import type { RefinerResult } from './types';

/**
 * Extract refiner result from agent response.
 * @param response - Agent response text (with TaskCompletion tags already stripped)
 * @returns Parsed RefinerResult object
 */
export function parseRefinerResult(response: string): Promise<RefinerResult> {
    // The evoltagent library strips <TaskCompletion> tags before calling postProcessor
    const fullResponse = response.trim();

    // Extract summary lines (Successfully applied, Failed to apply, Skipped)
    const lines = fullResponse.split('\n');
    const summaryLines: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (
            trimmedLine.startsWith('Successfully applied:') ||
            trimmedLine.startsWith('Failed to apply:') ||
            trimmedLine.startsWith('Skipped:')
        ) {
            summaryLines.push(trimmedLine);
        }
    }

    // Use summary lines array, or wrap full response if no summary lines found
    const summary = summaryLines.length > 0 ? summaryLines : [fullResponse];

    const summaryText = summary.join(' ').toLowerCase();
    const successCount = (summaryText.match(/successfully applied:/g) || []).length;
    const failedCount = (summaryText.match(/failed to apply:/g) || []).length;

    return Promise.resolve({
        success: successCount > 0 && failedCount === 0,
        summary,
        editsApplied: successCount,
        error: failedCount > 0 ? `${failedCount} edit(s) failed` : undefined,
    });
}
