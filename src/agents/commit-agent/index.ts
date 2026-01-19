import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { COMMIT_AGENT_SYSTEM_PROMPT } from './system-prompt';
import type { GitCommitOptions, GitCommitResult } from './types';
import { commitWithAgent } from './utils/commit';
import { getModelConfig } from '../../utils/config';

export type { GitCommitOptions, GitCommitResult } from './types';
export { COMMIT_AGENT_SYSTEM_PROMPT } from './system-prompt';
export { commitWithAgent } from './utils/commit';

const COMMIT_AGENT_CONTEXT_WINDOW_TOKENS = 1280000;

export function createCommitAgent(): Agent {
    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: COMMIT_AGENT_CONTEXT_WINDOW_TOKENS,
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

export async function commit(options: GitCommitOptions = {}): Promise<GitCommitResult> {
    const agent = createCommitAgent();
    return await commitWithAgent(agent, options);
}
