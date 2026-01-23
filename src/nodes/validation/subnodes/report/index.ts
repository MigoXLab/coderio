/**
 * Report utility for validation loop.
 * Generates HTML report file from userReport data.
 *
 * This is called at the END of validation-loop after userReport is created.
 * Similar to how commit() creates git commits during validation,
 * report() generates the HTML file from the completed userReport.
 */

import { logger } from '../../../../utils/logger';
import { ReportTool } from '../../../../tools/report-tool';
import type { UserReport } from '../../types';

export interface ReportOptions {
    userReport: UserReport;
    outputDir: string;
}

export interface ReportResult {
    success: boolean;
    htmlPath?: string;
    error?: string;
}

/**
 * Generate HTML report file from userReport.
 * This is called at the END of validation-loop after userReport is created.
 */
export async function report(options: ReportOptions): Promise<ReportResult> {
    try {
        const tool = new ReportTool();
        const result = await tool.generateHtml(options.userReport, options.outputDir);
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`Error generating report: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
}
