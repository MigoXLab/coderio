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
        if (!state.pageStructure) {
            logger.printErrorLog('No page structure found in state');
            return { success: false, error: 'No page structure found' };
        }

        if (!state.processedFigma?.frames?.length) {
            logger.printErrorLog('No Figma frames found in state');
            return { success: false, error: 'No Figma frames found' };
        }

        // Process the entire node tree
        const totalComponents = await processNode(state.pageStructure, state);

        // Inject root component to App.tsx
        await injectRootComponentToApp(state.pageStructure, state);

        logger.printSuccessLog(`✨ Code generation completed! Generated ${totalComponents} components`);

        return {
            success: true,
        };
    } catch (error) {
        logger.printErrorLog(`Code generation failed: ${(error as Error).message}`);
        return { success: false, error: (error as Error).message };
    }
}
