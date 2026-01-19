import { GraphState } from '../../state';
import { logger } from '../../utils/logger';
import { processNode, injectRootComponentToApp } from './utils';

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

        // Process the entire node tree
        const totalComponents = await processNode(state);

        // Inject root component to App.tsx
        await injectRootComponentToApp(state);

        logger.printSuccessLog(`✨ Code generation completed! Generated ${totalComponents} components`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Code generation failed: ${errorMessage}`);
    }
}
