import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';
import { LAUNCH_AGENT_PROMPT } from './prompt';
import { getModelConfig } from '../../utils/config';
import { AGENT_CONTEXT_WINDOW_TOKENS, MAX_OUTPUT_TOKENS } from '../../constants';
import { parseLaunchResult } from './utils';

export { launchAgentInstruction } from './instruction';
export type { LaunchAgentResult } from './types';

export function createLaunchAgent(): Agent {
    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: AGENT_CONTEXT_WINDOW_TOKENS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
    };

    return new Agent({
        name: 'LaunchAgent',
        profile: 'Expert DevOps and Frontend Engineer specialist in launching projects and troubleshooting build/runtime issues.',
        system: LAUNCH_AGENT_PROMPT,
        tools: [
            'CommandLineTool.execute',
            'CommandLineTool.list',
            'CommandLineTool.stop',
            'LaunchTool.startDevServer',
            'LaunchTool.stopDevServer',
            'FileEditor.read',
            'FileEditor.find',
            'FileEditor.findAndReplace',
            'FileEditor.write',
            'ThinkTool.execute',
        ],
        modelConfig,
        verbose: 2,
        postProcessor: parseLaunchResult,
    });
}
