import { createInitialAgent } from '../../agents/initial-agent';
import fs from 'node:fs';
import path from 'node:path';
import { GraphState } from '../../state';

/**
 * 'initial' node, responsible for initializing the empty project scaffold.
 * It uses an LLM-based agent to create the basic project structure and files.
 *
 * @param state - The current graph state
 * @returns An update to the graph state containing the updated workspace
 */
export const initialProject = async (state: GraphState) => {
    // TODO: Get model config from environment variables
    const modelConfig = {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        apiKey: 'sk-c4zUjThNszKiFoAIoV0t0Ej7vpd9M0uoxwd7kxbP71Alt3xt', // LLM API Key
        baseUrl: 'http://35.220.164.252:3888/v1', // Proxy/Gateway URL
        contextWindowTokens: 1280000,
        maxOutputTokens: 4096,
    };

    const appPath = state.workspace.app;
    if (!appPath) {
        throw new Error('Workspace application path is not defined.');
    }

    const initialAgent = createInitialAgent({ modelConfig, appPath });
    const result: unknown = await initialAgent.run(appPath);

    // Validate if essential files were created
    const essentialFiles = ['package.json', 'src', 'vite.config.ts', 'tsconfig.json'];
    for (const file of essentialFiles) {
        const fullPath = path.join(appPath, file);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Critical file/directory missing: "${file}". The project scaffolding may have failed.`);
        }
    }

    // TODO: replace via logger
    console.log('Agent result:', result);

    return {};
};
