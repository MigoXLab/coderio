import { createInitialAgent } from '../../agents/initial-agent';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../utils/logger';
import { getModelConfig } from '../../utils/config';
import { GraphState } from '../../state';

/**
 * 'initial' node, responsible for initializing the empty project scaffold.
 * It uses an LLM-based agent to create the basic project structure and files.
 */
export const initialProject = async (state: GraphState) => {
    logger.printInfoLog('Initializing project...');

    const envConfig = getModelConfig();
    const modelConfig = {
        ...envConfig,
        contextWindowTokens: 1280000,
        maxOutputTokens: 4096,
    };

    const appPath = state.workspace.paths.app;
    if (!appPath) {
        throw new Error('Workspace application path is not defined.');
    }

    const initialAgent = createInitialAgent({ modelConfig, appPath });
    const result: unknown = await initialAgent.run(appPath);

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
