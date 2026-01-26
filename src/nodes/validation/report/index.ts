/**
 * Report subnode for validation loop.
 * Orchestrates report generation: validation results → userReport → HTML file.
 *
 * This is called at the END of validation-loop with pre-computed validation results.
 * Delegates to ReportTool for visualization and HTML generation.
 */

import { logger } from '../../../utils/logger';
import { ReportTool } from '../../../tools/report-tool';
import type { ReportOptions, ReportResult } from '../types';

/**
 * Generate complete validation report: userReport structure + HTML file.
 * This is the single entry point for all reporting in the validation loop.
 */
export async function report(options: ReportOptions): Promise<ReportResult> {
    const tool = new ReportTool();

    try {
        // Step 1: Generate userReport with screenshots
        logger.printInfoLog('Generating validation report structure...');
        const reportResult = await tool.generateReport({
            validationResult: options.validationResult,
            figmaThumbnailUrl: options.figmaThumbnailUrl,
            cachedFigmaThumbnailBase64: options.cachedFigmaThumbnailBase64,
            designOffset: options.designOffset,
            outputDir: options.outputDir,
            serverUrl: options.serverUrl,
        });

        // Step 2: Generate HTML file from userReport
        logger.printInfoLog('Generating HTML report file...');
        const htmlResult = await tool.generateHtml(reportResult.userReport, options.outputDir);

        if (!htmlResult.success) {
            logger.printWarnLog(`Failed to generate HTML: ${htmlResult.error}`);
            return {
                success: false,
                error: htmlResult.error,
                userReport: reportResult.userReport,
            };
        }

        logger.printSuccessLog(`Report generated successfully: ${htmlResult.htmlPath}`);
        return {
            success: true,
            htmlPath: htmlResult.htmlPath,
            userReport: reportResult.userReport,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`Error generating report: ${errorMessage}`);

        // Fallback: Create minimal report
        const minimalReport = tool.createMinimalReport({
            serverUrl: options.serverUrl,
            figmaThumbnailUrl: options.figmaThumbnailUrl,
            mae: options.validationResult?.mae,
            sae: options.validationResult?.sae,
        });

        return {
            success: false,
            error: errorMessage,
            userReport: minimalReport,
        };
    }
}
