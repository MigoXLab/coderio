/**
 * Refiner Agent: Code editor specialist.
 *
 * Simplified actor-critic pattern with structured output via post-processor.
 * Uses evoltjs Agent class for file editing tools.
 */

import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import type { RefinerResult } from './types';
import { REFINER_PROMPT } from './system-prompt';
export { formatRefinerInstruction } from './refiner-instruction';

/**
 * Default model configuration for refiner agent
 */
const REFINER_MODEL_CONFIG: ModelConfig = {
    provider: 'openai',
    model: 'gpt-5.2',
    apiKey: process.env.BOYUE_API_KEY || '',
    baseUrl: process.env.BOYUE_API_URL || '',
    contextWindowTokens: 128000,
};

/**
 * Extract refiner result from agent response.
 *
 * @param response - Agent response text
 * @returns Parsed RefinerResult object
 */
export function parseRefinerResult(response: string): Promise<RefinerResult> {
    // Extract content from <TaskCompletion> tags
    const taskMatch = response.match(/<TaskCompletion>([\s\S]*?)<\/TaskCompletion>/);
    const fullResponse = taskMatch?.[1]?.trim() ?? response;

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

/**
 * Create refiner agent (actor) for applying fixes.
 *
 * @param workspaceDir - Optional workspace directory to restrict file access
 * @returns Agent configured with FileEditor tools and structured output
 */
export function createRefinerAgent(workspaceDir?: string): Agent {
    let systemPrompt = REFINER_PROMPT;
    if (workspaceDir) {
        systemPrompt += `\n\nWORKSPACE: ${workspaceDir}\nOnly modify files within this workspace.`;
    }

    return new Agent({
        name: 'RefinerAgent',
        profile: 'Code editor specialist',
        system: systemPrompt,
        tools: ['FileEditor.read', 'FileEditor.find', 'FileEditor.findAndReplace'],
        modelConfig: REFINER_MODEL_CONFIG,
        postProcessor: parseRefinerResult,
        verbose: 1,
    });
}

