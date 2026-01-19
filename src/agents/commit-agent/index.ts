import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { COMMIT_AGENT_SYSTEM_PROMPT } from './system-prompt';
import type { GitCommitOptions, GitCommitResult } from './types';
import { commitWithAgent } from './utils/commit';

export type { GitCommitOptions, GitCommitResult } from './types';
export { COMMIT_AGENT_SYSTEM_PROMPT } from './system-prompt';

const DEFAULT_MODEL_CONFIG: ModelConfig = {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.BOYUE_API_KEY || '',
    baseUrl: process.env.BOYUE_API_URL || '',
    contextWindowTokens: 1280000,
};

export function createCommitAgent(modelConfig: ModelConfig = DEFAULT_MODEL_CONFIG): Agent {
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

