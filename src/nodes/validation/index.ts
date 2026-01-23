/**
 * Validation module.
 */

import fs from 'node:fs';
import path from 'node:path';

import type { GraphState } from '../../state';
import { METRIC_DECIMAL_PLACES } from './constants';
import { logger } from '../../utils/logger';
import { validationLoop } from './core/validation-loop';
import type { ValidationResult } from './types';

/**
 * LangGraph node: run validation on the generated app and write a report into the workspace.
 * Reads validation mode from state.config.validationMode (defaults to 'full').
 * Returns empty object for graph state (terminal node), but provides validation results for direct invocation.
 */
export const runValidation = async (state: GraphState): Promise<ValidationResult> => {
    if (!state.protocol) {
        throw new Error('No protocol found for validation (state.protocol is missing).');
    }
    if (!state.figmaInfo?.thumbnail) {
        throw new Error('Missing Figma thumbnail URL (state.figmaInfo.thumbnail is missing).');
    }

    const mode = state.config?.validationMode ?? 'full';
    const outputDir = path.join(state.workspace.root, 'validation');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    logger.printLog(`Starting validation loop (mode: ${mode})...`);

    const result = await validationLoop({
        protocol: state.protocol,
        figmaThumbnailUrl: state.figmaInfo.thumbnail,
        outputDir,
        workspace: state.workspace,
        config: { mode },
    });

    if (result.error) {
        throw new Error(result.error);
    }

    const reportHtmlPath = path.join(outputDir, 'index.html');
    logger.printLog(
        `Validation complete: ${result.validationPassed ? 'PASSED' : 'FAILED'} (MAE: ${result.finalMae.toFixed(METRIC_DECIMAL_PLACES)}px)`
    );
    logger.printLog(`Validation report: ${reportHtmlPath}`);

    return {
        validationPassed: result.validationPassed,
        reportDir: outputDir,
        reportHtmlPath,
    };
};

export { validationLoop };
export * from './types';
