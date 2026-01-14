import { Agent, type ModelConfig } from 'evoltagent';
import { initialAgentPrompt } from './prompt';

interface CreateInitialAgentOptions {
    modelConfig: ModelConfig;
    appPath: string;
}

/**
 * Creates an initial agent for scaffolding a project.
 * @param options - The options for creating the agent.
 * @param options.modelConfig - The model configuration.
 * @param options.appPath - The path to the app.
 * @returns The initial agent.
 */
export function createInitialAgent(options: CreateInitialAgentOptions): Agent {
    const { modelConfig, appPath } = options;
    const systemPrompt = initialAgentPrompt({ appPath });
    const systemTools = ['ThinkTool.execute', 'FileEditor.read', 'FileEditor.write'];

    return new Agent({
        name: 'InitialAgent',
        profile: 'Expert Frontend Engineer specialized in project scaffolding with React, TypeScript, and Tailwind CSS V4.',
        system: systemPrompt,
        tools: systemTools,
        modelConfig,
        verbose: true,
    });
}
