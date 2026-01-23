import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { COMMIT_AGENT_SYSTEM_PROMPT } from './prompt';
import { getModelConfig } from '../../utils/config';
import { AGENT_CONTEXT_WINDOW_TOKENS, MAX_OUTPUT_TOKENS } from '../../constants';

export { COMMIT_AGENT_SYSTEM_PROMPT } from './prompt';
export { formatGitCommitInstruction } from './instruction';

export function createCommitAgent(): Agent {
    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: AGENT_CONTEXT_WINDOW_TOKENS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
    };

    return new Agent({
        name: 'CommitAgent',
        profile: 'A helpful assistant that commits local changes in a repository.',
        system: COMMIT_AGENT_SYSTEM_PROMPT,
        tools: ['GitTool.init', 'GitTool.status', 'GitTool.add', 'GitTool.diff', 'GitTool.commit'],
        modelConfig,
        verbose: 1,
        toolcallManagerPoolSize: 1,
    });
}
