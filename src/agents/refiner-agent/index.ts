/**
 * Refiner Agent: Code editor specialist.
 *
 * Simplified actor-critic pattern with structured output via post-processor.
 * Uses evoltjs Agent class for file editing tools.
 */

import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { REFINER_PROMPT } from './prompt';
import { getModelConfig } from '../../utils/config';
import { AGENT_CONTEXT_WINDOW_TOKENS, MAX_OUTPUT_TOKENS } from '../../constants';
import { parseRefinerResult } from './utils';
export { formatRefinerInstruction } from './instruction';

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

    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: AGENT_CONTEXT_WINDOW_TOKENS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        stream: true,
    };

    return new Agent({
        name: 'RefinerAgent',
        profile: 'Code editor specialist',
        system: systemPrompt,
        tools: ['FileEditor.read', 'FileEditor.find', 'FileEditor.findAndReplace'],
        modelConfig,
        postProcessor: parseRefinerResult,
        verbose: 2,
    });
}
