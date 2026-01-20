/**
 * Validation module (coderio-native).
 *
 * This file intentionally avoids any old-repo dependencies (`config/output`, `core/node`, etc.).
 * Graph wiring happens in `src/graph.ts` (see todo: graph-validation-node).
 */

import fs from 'node:fs';
import path from 'node:path';

import type { GraphState } from '../../state';
import { METRIC_DECIMAL_PLACES } from '../../constants/validation';
import { logger } from '../../utils/logger';
import { validationLoop } from './core/validation-loop';
import { extractFigmaTreeFromProtocol } from './utils/extraction/extract-figma-tree.js';

/**
 * LangGraph node: run validation on the generated app and write a report into the workspace.
 */
export const runValidation = async (state: GraphState, _langGraphConfig?: unknown, options?: { mode?: 'reportOnly' | 'full' }) => {
    if (!state.protocol) {
        throw new Error('No protocol found for validation (state.protocol is missing).');
    }
    if (!state.figmaInfo?.thumbnail) {
        throw new Error('Missing Figma thumbnail URL (state.figmaInfo.thumbnail is missing).');
    }

    const figmaTree = extractFigmaTreeFromProtocol(state.protocol);

    const workspaceDir = state.workspace.app;
    const outputDir = path.join(state.workspace.root, 'validation');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    logger.printLog('Starting validation loop...');

    const result = await validationLoop({
        figmaJson: figmaTree,
        structureTree: state.protocol,
        figmaThumbnailUrl: state.figmaInfo.thumbnail,
        outputDir,
        workspaceDir,
        config: options?.mode ? { mode: options.mode } : undefined,
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
        validationSatisfied: result.validationPassed,
        validationReportDir: outputDir,
        validationReportHtmlPath: reportHtmlPath,
    };
};

export { validationLoop };
export * from './types';
