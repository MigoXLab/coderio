import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';
import { LAUNCH_AGENT_PROMPT } from './prompt';
import { getModelConfig } from '../../utils/config';
import { AGENT_CONTEXT_WINDOW_TOKENS } from '../../constants';

export function createLaunchAgent(): Agent {
    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: AGENT_CONTEXT_WINDOW_TOKENS,
    };

    return new Agent({
        name: 'LaunchAgent',
        profile: 'Expert DevOps and Frontend Engineer specialist in launching projects and troubleshooting build/runtime issues.',
        system: LAUNCH_AGENT_PROMPT,
        tools: [
            'CommandLineTool.execute',
            'FileEditor.read',
            'FileEditor.find',
            'FileEditor.findAndReplace',
            'FileEditor.write',
            'ThinkTool.execute',
        ],
        modelConfig,
        verbose: 1,
    });
}
