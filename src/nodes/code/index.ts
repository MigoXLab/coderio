import { GraphState } from '../../state';
import { logger } from '../../utils/logger';
import { processNode, injectRootComponentToApp } from './utils';
import { loadCodeCache } from '../../utils/code-cache';

/**
 * Main code generation node function
 * Generates React components from the page structure tree
 */
export async function generateCode(state: GraphState) {
    try {
        logger.printInfoLog('🚀 Starting Code Generation...');

        // Validate required state fields
        if (!state.protocol) {
            throw new Error('No protocol data found');
        }

        // Load code cache
        const cache = loadCodeCache(state.workspace);

        // Process the entire node tree (cache is saved incrementally after each component)
        const totalComponents = await processNode(state, cache);

        // Inject root component to App.tsx (cache is saved after injection)
        await injectRootComponentToApp(state, cache);

        logger.printSuccessLog(`✨ Code generation completed! Generated ${totalComponents} components`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Code generation failed: ${errorMessage}`);
    }
}
