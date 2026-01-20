import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { COMMIT_AGENT_SYSTEM_PROMPT } from './system-prompt';
import { getModelConfig } from '../../utils/config';
import { AGENT_CONTEXT_WINDOW_TOKENS } from '../../constants';

export type { GitCommitOptions, GitCommitResult } from './types';
export { COMMIT_AGENT_SYSTEM_PROMPT } from './system-prompt';
export { formatGitCommitInstruction } from './commit-instruction';

export function createCommitAgent(): Agent {
    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: AGENT_CONTEXT_WINDOW_TOKENS,
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
