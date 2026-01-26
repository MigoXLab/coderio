/**
 * Report generation tool for validation results.
 * Provides pure visualization and formatting.
 */

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { tools } from 'evoltagent';

import { logger } from '../../utils/logger';
import { VisualizationTool } from '../visualization-tool';
import type { MisalignedComponentData } from '../visualization-tool/types';
import type { UserReport } from '../../types/validation-types';
import type { ReportGenerationRequest, ReportGenerationResult, ErrorReportOptions, GenerateHtmlResult } from './types';

export type { ReportGenerationRequest, ReportGenerationResult, ErrorReportOptions, GenerateHtmlResult } from './types';

@tools({
    generateReport: {
        description:
            'Generate visual validation report structure from pre-computed validation results. Creates annotated screenshots, heatmap, and userReport structure.',
        params: [
            {
                name: 'request',
                type: 'object',
                description: 'ReportGenerationRequest with validationResult, figmaThumbnailUrl, serverUrl, outputDir, etc.',
            },
        ],
        returns: { type: 'object', description: 'ReportGenerationResult with userReport and misalignedCount' },
    },
    createMinimalReport: {
        description: 'Create a minimal user report for error scenarios without screenshots',
        params: [{ name: 'options', type: 'object', description: 'ErrorReportOptions with serverUrl, figmaThumbnailUrl, mae, sae' }],
        returns: { type: 'object', description: 'Minimal UserReport structure' },
    },
    generateHtml: {
        description: 'Generate standalone HTML report file from userReport with embedded data and inlined assets',
        params: [
            { name: 'userReport', type: 'object', description: 'UserReport data from validation with screenshots and metrics' },
            { name: 'outputDir', type: 'string', description: 'Output directory path for HTML file' },
        ],
        returns: { type: 'object', description: 'GenerateHtmlResult with success/htmlPath/error' },
    },
})
export class ReportTool {
    /**
     * Generate visual validation report from validation results.
     *
     * This method ONLY does visualization and formatting:
     * - Annotates browser and Figma screenshots with error markers
     * - Generates pixel difference heatmap
     * - Builds userReport structure
     *
     */
    async generateReport(request: ReportGenerationRequest): Promise<ReportGenerationResult> {
        logger.printInfoLog('\nGenerating validation report...');

        const visualizationTool = new VisualizationTool();
        const { validationResult } = request;

        // Prepare output directory
        const comparisonDir = path.join(request.outputDir, 'comparison_screenshots');
        if (!fs.existsSync(comparisonDir)) {
            fs.mkdirSync(comparisonDir, { recursive: true });
        }

        // Transform validation data to visualization format
        const misalignedData = visualizationTool['formatForVisualization'](validationResult.misalignedComponents);
        logger.printInfoLog(`Final misaligned components: ${misalignedData.length}`);

        // Generate annotated screenshots
        const render = await visualizationTool.annotateRender(request.serverUrl, misalignedData, validationResult.viewport);

        // Use cached thumbnail if available to avoid redundant download
        const targetMarked = request.cachedFigmaThumbnailBase64
            ? await visualizationTool.annotateTargetFromBase64(
                  request.cachedFigmaThumbnailBase64,
                  misalignedData,
                  validationResult.viewport,
                  request.designOffset
              )
            : await visualizationTool.annotateTarget(
                  request.figmaThumbnailUrl,
                  misalignedData,
                  validationResult.viewport,
                  request.designOffset
              );

        const screenshots = {
            renderSnap: validationResult.screenshots?.renderSnap || render.renderSnap,
            renderMarked: render.renderMarked,
            targetMarked,
        };

        // Generate combined comparison screenshot
        const finalScreenshotPath = path.join(comparisonDir, 'final.webp');
        await visualizationTool.combine(screenshots.renderMarked, screenshots.targetMarked, finalScreenshotPath);
        logger.printSuccessLog(`Saved final comparison screenshot: ${path.basename(finalScreenshotPath)}`);

        // Generate pixel difference heatmap
        let heatmap = '';
        try {
            heatmap = await visualizationTool.diffHeatmap(screenshots.renderSnap, request.figmaThumbnailUrl);

            if (heatmap) {
                const heatmapPath = path.join(comparisonDir, 'heatmap.webp');
                const base64Data = heatmap.split(',')[1];
                if (!base64Data) {
                    throw new Error('Invalid heatmap data URI format');
                }
                const buffer = Buffer.from(base64Data, 'base64');
                await fs.promises.writeFile(heatmapPath, buffer);
                logger.printSuccessLog(`Saved pixel difference heatmap: ${path.basename(heatmapPath)}`);
            }
        } catch (heatmapError) {
            const errorMsg = heatmapError instanceof Error ? heatmapError.message : 'Unknown error';
            logger.printWarnLog(`Failed to generate pixel difference heatmap: ${errorMsg}. Continuing without heatmap.`);
        }

        // Build userReport structure (pure data formatting)
        const userReport = this.buildUserReportStructure(
            validationResult.mae,
            validationResult.sae,
            misalignedData.length,
            screenshots,
            heatmap,
            request.serverUrl,
            request.figmaThumbnailUrl,
            misalignedData
        );

        logger.printSuccessLog('Validation report generated successfully');

        return {
            userReport,
            misalignedCount: misalignedData.length,
        };
    }

    /**
     * Creates a minimal user report for error scenarios.
     */
    createMinimalReport(options: ErrorReportOptions): UserReport {
        return {
            design: {
                snap: options.figmaThumbnailUrl || '',
                markedSnap: '',
            },
            page: {
                url: options.serverUrl,
                snap: '',
                markedSnap: '',
            },
            report: {
                heatmap: '',
                detail: {
                    metrics: {
                        mae: options.mae ?? -1,
                        sae: options.sae ?? -1,
                        misalignedCount: 0,
                    },
                    components: [],
                },
            },
        };
    }

    /**
     * Generate standalone HTML report file from userReport.
     * Inlines all assets (JS/CSS) for single-file distribution.
     */
    async generateHtml(userReport: UserReport, outputDir: string): Promise<GenerateHtmlResult> {
        const reportDistDir = this.getReportDistDir();
        const reportIndexHtml = path.join(reportDistDir, 'index.html');
        logger.printInfoLog(`[ReportTool] Using template: ${reportIndexHtml}`);
        logger.printInfoLog(`[ReportTool] Output directory: ${outputDir}`);

        try {
            // Check if template exists
            try {
                await fsPromises.access(reportIndexHtml);
            } catch {
                const errorMsg = `Template not found at ${reportIndexHtml}`;
                logger.printErrorLog(`[ReportTool] ${errorMsg}. Skipping report generation.`);
                return { success: false, error: errorMsg };
            }

            // Ensure output directory exists
            await fsPromises.mkdir(outputDir, { recursive: true });

            // Transform data if it exists
            let reportData = userReport;
            if (reportData) {
                reportData = this.transformReportData(reportData);
            }

            logger.printTestLog(`Report data: ${JSON.stringify(reportData)}`);
            let htmlContent = await fsPromises.readFile(reportIndexHtml, 'utf-8');

            // 1. Inject Data
            // Serialize report data as JSON and inject directly into the HTML
            // Only escape characters that could break the HTML context
            const jsonString = JSON.stringify(reportData)
                .replace(/<\/script>/gi, '<\\/script>') // Prevent script injection
                .replace(/\u2028/g, '\\u2028') // Line separator (breaks JS string literals)
                .replace(/\u2029/g, '\\u2029'); // Paragraph separator (breaks JS string literals)

            // Assign JSON object directly - no JSON.parse needed
            const scriptTag = `<script>window.__REPORT_DATA__ = ${jsonString};</script>`;
            htmlContent = htmlContent.replace(/<script>\s*window\.__REPORT_DATA__\s*=\s*null;?\s*<\/script>/, scriptTag);

            // 2. Inline Assets (JS) to make it single-file
            // Find ALL script tags with src="/assets/..." and pre-read files
            const scriptRegexGlobal = /<script\s+type="module"\s+crossorigin\s+src="\/assets\/([^"]+)"><\/script>/g;
            const jsMatches = [...htmlContent.matchAll(scriptRegexGlobal)];
            const jsContentsMap = new Map<string, string>();

            for (const match of jsMatches) {
                const fileName = match[1];
                if (fileName) {
                    const jsFilePath = path.join(reportDistDir, 'assets', fileName);
                    try {
                        let jsContent = await fsPromises.readFile(jsFilePath, 'utf-8');
                        // Prevent </script> inside JS from breaking HTML
                        jsContent = jsContent.replace(/<\/script>/g, '\\u003c/script>');
                        jsContentsMap.set(fileName, jsContent);
                    } catch {
                        logger.printWarnLog(`[ReportTool] JS asset not found: ${jsFilePath}`);
                    }
                }
            }

            htmlContent = htmlContent.replace(scriptRegexGlobal, (match, fileName: string) => {
                const jsContent = jsContentsMap.get(fileName);
                if (jsContent) {
                    return `<script type="module">${jsContent}</script>`;
                }
                return match; // Keep original if file not found
            });

            // 3. Inline CSS if exists (Vite might produce css in assets)
            const cssRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="\/assets\/(.*?)">/;
            const cssMatch = htmlContent.match(cssRegex);
            if (cssMatch) {
                const cssFileName = cssMatch[1];
                if (!cssFileName) {
                    logger.printWarnLog('[ReportTool] CSS filename not found in match');
                } else {
                    const cssFilePath = path.join(reportDistDir, 'assets', cssFileName);
                    try {
                        const cssContent = await fsPromises.readFile(cssFilePath, 'utf-8');
                        htmlContent = htmlContent.replace(cssMatch[0], `<style>${cssContent}</style>`);
                    } catch {
                        // CSS file not found, skip inlining
                    }
                }
            }

            // Remove /index.css reference if it doesn't exist
            htmlContent = htmlContent.replace('<link rel="stylesheet" href="/index.css">', '');

            const absoluteOutputPath = path.join(outputDir, 'index.html');
            await fsPromises.writeFile(absoluteOutputPath, htmlContent);

            return { success: true, htmlPath: absoluteOutputPath };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger.printErrorLog(`[ReportTool] Failed to generate report: ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Build userReport structure from validation results
     */
    private buildUserReportStructure(
        mae: number,
        sae: number,
        misalignedCount: number,
        screenshots: { renderSnap: string; renderMarked: string; targetMarked: string },
        heatmap: string,
        serverUrl: string,
        figmaThumbnailUrl: string,
        misalignedData: MisalignedComponentData[]
    ): UserReport {
        return {
            design: {
                snap: figmaThumbnailUrl,
                markedSnap: screenshots.targetMarked,
            },
            page: {
                url: serverUrl,
                snap: screenshots.renderSnap,
                markedSnap: screenshots.renderMarked,
            },
            report: {
                heatmap: heatmap,
                detail: {
                    metrics: {
                        mae,
                        sae,
                        misalignedCount,
                    },
                    components: misalignedData.map(c => ({
                        componentId: c.componentId,
                        componentPath: c.componentPath,
                        elementId: c.elementId,
                        validationInfo: {
                            x: c.xDelta,
                            y: c.yDelta,
                        },
                    })),
                },
            },
        };
    }

    /**
     * Transform report data by grouping components by componentId
     */
    private transformReportData(reportData: UserReport): UserReport {
        const components = reportData?.report?.detail?.components || [];

        if (!components?.length) return reportData;

        // Group components by componentId
        const groupedComponentsMap = new Map<string, UserReport['report']['detail']['components'][number]>();

        components.forEach((component: UserReport['report']['detail']['components'][number], index: number) => {
            const { componentId, componentPath, elementId, validationInfo } = component;
            const elementIndex = index + 1;

            if (!groupedComponentsMap.has(componentId)) {
                groupedComponentsMap.set(componentId, {
                    componentId,
                    componentPath,
                    elements: [],
                });
            }

            groupedComponentsMap.get(componentId)?.elements?.push({
                elementId: elementId || '',
                elementIndex,
                validationInfo: validationInfo || { x: 0, y: 0 },
            });
        });

        const groupedComponents = Array.from(groupedComponentsMap.values());

        return {
            ...reportData,
            report: {
                ...reportData.report,
                detail: {
                    ...reportData.report.detail,
                    components: groupedComponents,
                },
            },
        };
    }

    /**
     * Determine the root directory of the package by walking up to find package.json
     */
    private getPackageRoot(): string {
        // In ES modules, __dirname is not available, construct it from import.meta.url
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Walk up the directory tree to find package.json
        let currentDir = __dirname;
        while (currentDir !== path.parse(currentDir).root) {
            if (fs.existsSync(path.join(currentDir, 'package.json'))) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }

        return process.cwd(); // Fallback
    }

    /**
     * Get the report dist directory containing built HTML/assets
     */
    private getReportDistDir(): string {
        const root = this.getPackageRoot();

        // Check standard locations for report template
        const paths = [
            path.join(root, 'dist/tools/report-tool/template'), // Production layout (if copied)
            path.join(root, 'src/tools/report-tool/template/dist'), // Development layout
        ];

        for (const p of paths) {
            if (fs.existsSync(path.join(p, 'index.html'))) {
                return p;
            }
        }

        // Fallback to development layout
        return path.join(root, 'src/tools/report-tool/template/dist');
    }
}
