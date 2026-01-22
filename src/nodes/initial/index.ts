import { createInitialAgent } from '../../agents/initial-agent';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../utils/logger';
import { getModelConfig } from '../../utils/config';
import { GraphState } from '../../state';
import { MAX_OUTPUT_TOKENS, CONTEXT_WINDOW_TOKENS } from '../../constants';
import { initialAgentInstruction } from '../../agents/initial-agent/instruction';

/**
 * 'initial' node, responsible for initializing the empty project scaffold.
 * It uses an LLM-based agent to create the basic project structure and files.
 */
export const initialProject = async (state: GraphState) => {
    logger.printInfoLog('Initializing project...');

    const envConfig = getModelConfig();
    const modelConfig = {
        ...envConfig,
        contextWindowTokens: CONTEXT_WINDOW_TOKENS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
    };

    const appPath = state.workspace.app;
    const appName = state.urlInfo.name || '';
    if (!appPath) {
        throw new Error('Workspace application path is not defined.');
    }

    const initialAgent = createInitialAgent(modelConfig);
    const result: unknown = await initialAgent.run(initialAgentInstruction({ appPath, appName }));

    // Validate if essential files were created
    const essentialFiles = ['package.json', 'src', 'vite.config.ts', 'tsconfig.json', 'index.html', 'src/main.tsx', 'src/App.tsx'];
    for (const file of essentialFiles) {
        const fullPath = path.join(appPath, file);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Critical file/directory missing: "${file}". The project scaffolding may have failed.`);
        }
    }

    logger.printSuccessLog(result as string);

    return {};
};
