/**
 * Validation module.
 */

import fs from 'node:fs';
import path from 'node:path';

import type { GraphState } from '../../state';
import { METRIC_DECIMAL_PLACES } from './constants';
import { logger } from '../../utils/logger';
import { validationLoop } from './core/validation-loop';
import { commit } from './commit/index';

/**
 * LangGraph node: run validation on the generated app and write a report into the workspace.
 * Reads validation mode from state.config.validationMode (defaults to 'full').
 * Throws error if validation fails (MAE threshold not reached) or execution errors occur.
 */
export const runValidation = async (state: GraphState): Promise<void> => {
    if (!state.protocol) {
        throw new Error('No protocol found for validation (state.protocol is missing).');
    }
    if (!state.figmaInfo?.thumbnail) {
        throw new Error('Missing Figma thumbnail URL (state.figmaInfo.thumbnail is missing).');
    }

    const mode = state.config?.validationMode ?? 'full';
    // Code-only mode: skip validation, only commit and exit
    if (mode === 'codeOnly') {
        logger.printInfoLog('Code-only mode: skipping validation, committing generated code...');
        const commitResult = await commit({ appPath: state.workspace.app });
        if (!commitResult.success) {
            logger.printWarnLog(`Git commit failed: ${commitResult.message}`);
        } else {
            logger.printSuccessLog('Git commit completed successfully!');
        }
        return;
    }

    const outputDir = path.join(state.workspace.process, 'validation');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    logger.printInfoLog(`Starting validation loop (mode: ${mode})...`);

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
    if (result.validationPassed) {
        logger.printSuccessLog(`Validation PASSED (MAE: ${result.finalMae.toFixed(METRIC_DECIMAL_PLACES)}px)`);
    } else {
        logger.printWarnLog(`Validation FAILED (MAE: ${result.finalMae.toFixed(METRIC_DECIMAL_PLACES)}px)`);
        throw new Error(`Validation failed: MAE ${result.finalMae.toFixed(METRIC_DECIMAL_PLACES)}px exceeds threshold`);
    }
    logger.printInfoLog(`Validation report: ${reportHtmlPath}`);
};
