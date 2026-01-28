/**
 * Main validation loop orchestration.
 *
 * Simplified actor-critic pattern with in-memory data passing.
 * Iteratively validates positions, diagnoses errors, applies fixes until
 * MAE threshold is met or max iterations reached.
 */

import * as fs from 'fs';
import * as path from 'path';

import { DEFAULT_VALIDATION_LOOP_CONFIG } from '../constants';
import { logger } from '../../../utils/logger';
import { commit } from '../commit/index';
import { createJudgerAgent } from '../../../agents/judger-agent';
import { formatJudgerInstruction } from '../../../agents/judger-agent/instruction';
import { createRefinerAgent, formatRefinerInstruction } from '../../../agents/refiner-agent';
import { launch } from '../launch/index';
import type { ComponentHistory, MisalignedComponent, Dict } from '../../../types/validation-types';
import type { JudgerDiagnosis } from '../../../agents/judger-agent/types';
import type { RefinerResult } from '../../../agents/refiner-agent/types';
import type {
    ComponentCorrectionLog,
    IterationLog,
    ProcessedOutput,
    RefinementContext,
    ValidationIterationResult,
    ValidationLoopConfig,
    ValidationLoopParams,
    ValidationLoopResult,
    SkippedElement,
} from '../types';
import { extractLayoutFromContext } from '../utils/extraction/extract-layout-metadata';
import { report } from '../report/index';
import { LaunchTool } from '../../../tools/launch-tool';
import { VisualizationTool } from '../../../tools/visualization-tool';
import { extractValidationContext, extractComponentPaths, toElementMetadataRegistry } from '../utils/extraction/extract-protocol-context';
import { validatePositions } from './validate-position';
import { downloadImage } from '../../../tools/figma-tool/images';

function filterComponentsToFix(misaligned: MisalignedComponent[], positionThreshold: number): MisalignedComponent[] {
    return misaligned.filter(comp => {
        const [errorX, errorY] = comp.validationReport.absoluteError;
        return errorX > positionThreshold || errorY > positionThreshold;
    });
}

function recordComponentPosition(comp: MisalignedComponent, iteration: number, componentHistory: ComponentHistory): void {
    const history = componentHistory[comp.componentId] ?? [];
    history.push({
        iteration,
        position: comp.validationReport.currentPosition,
        error: comp.validationReport.absoluteError,
        fixApplied: null,
    });
    componentHistory[comp.componentId] = history;
}

async function refineComponent(comp: MisalignedComponent, context: RefinementContext): Promise<ComponentCorrectionLog> {
    const { workspace, structureTree, componentPaths, componentHistory, validationContext, previousScreenshotPath } = context;

    try {
        // Extract element IDs from context for this component
        const elementIds = Array.from(validationContext.elements.values())
            .filter((e): e is NonNullable<typeof e> => e.parentComponentId === comp.componentId)
            .map(e => e.id);

        const figmaMetadata = extractLayoutFromContext(validationContext, elementIds);

        logger.printLog(`  Analyzing ${comp.name}...`);
        const judger = createJudgerAgent({
            workspaceDir: workspace.app,
            structureTree,
            componentPaths,
            history: componentHistory,
        });
        const judgerInstruction = formatJudgerInstruction(comp, figmaMetadata as unknown as Record<string, unknown>, componentPaths);
        const judgerImages = previousScreenshotPath ? [previousScreenshotPath] : undefined;
        const diagnosis = (await judger.run(judgerInstruction, judgerImages)) as JudgerDiagnosis;

        logger.printLog(`     Error type: ${diagnosis.errorType}`);
        logger.printLog(`     Fix instructions: ${diagnosis.refineInstructions?.length || 0}`);

        logger.printLog(`  Applying fixes to ${comp.name}...`);
        const refiner = createRefinerAgent(workspace.app);
        const refinerInstruction = formatRefinerInstruction(comp, diagnosis, componentPaths);
        const refinerResult = (await refiner.run(refinerInstruction)) as RefinerResult;

        if (refinerResult.success) {
            logger.printSuccessLog(`${comp.name}: ${refinerResult.editsApplied} edits applied`);
        } else {
            logger.printWarnLog(`${comp.name}: ${refinerResult.editsApplied} edits applied`);
        }

        const history = componentHistory[comp.componentId];
        const last = history?.at(-1);
        if (last) {
            last.fixApplied = refinerResult.summary;
        }

        return {
            componentId: comp.componentId,
            componentPath: comp.path,
            elementIds: comp.elementIds,
            validationReport: comp.validationReport,
            diagnosis,
            refinerResult,
            positionHistory: history ? [...history] : undefined,
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.printWarnLog(`  FAILED ${comp.name}: ${errorMsg}. Skipping component refinement.`);

        const history = componentHistory[comp.componentId];
        return {
            componentId: comp.componentId,
            componentPath: comp.path,
            elementIds: comp.elementIds,
            validationReport: comp.validationReport,
            diagnosis: undefined,
            refinerResult: undefined,
            positionHistory: history ? [...history] : undefined,
        };
    }
}

function saveProcessedJson(outputDir: string, processedOutput: ProcessedOutput): void {
    const processedJsonPath = path.join(outputDir, 'processed.json');
    fs.writeFileSync(processedJsonPath, JSON.stringify(processedOutput, null, 2));
    logger.printInfoLog('Saved processed.json');
}

// Helper functions for reducing code duplication
async function performCommit(appPath: string, iteration: number | undefined, stage: string): Promise<void> {
    const commitResult = await commit({ appPath, iteration });
    if (!commitResult.success) {
        logger.printWarnLog(`Git commit (${stage}) failed: ${commitResult.message}`);
    } else if (iteration === undefined) {
        logger.printSuccessLog(`Initial project committed successfully, starting validation loop...`);
    }
}

function saveIterationAndProcessedJson(
    iterations: IterationLog[],
    iteration: number,
    currentMae: number,
    currentSae: number,
    misalignedCount: number,
    components: ComponentCorrectionLog[],
    screenshotPath: string,
    skippedElements: SkippedElement[] | undefined,
    outputDir: string,
    targetMae: number
): void {
    // Add current iteration to log
    iterations.push({
        iteration,
        metrics: { mae: currentMae, sae: currentSae, misalignedCount },
        components,
        screenshotPath,
        skippedElements: skippedElements && skippedElements.length > 0 ? skippedElements : undefined,
    });

    // Save processed.json with updated iterations
    const processedOutput: ProcessedOutput = {
        iterations,
        finalResult: {
            success: currentMae <= targetMae,
            finalMae: currentMae,
            finalSae: currentSae,
            totalIterations: iterations.length,
            misalignedCount,
        },
    };
    saveProcessedJson(outputDir, processedOutput);
}

export async function validationLoop(params: ValidationLoopParams): Promise<ValidationLoopResult> {
    const { protocol, figmaThumbnailUrl, outputDir, workspace } = params;

    if (!protocol || !figmaThumbnailUrl || !outputDir || !workspace) {
        throw new Error('Something wrong in validation loop, missing required parameters...');
    }

    const config: ValidationLoopConfig = {
        ...DEFAULT_VALIDATION_LOOP_CONFIG,
        ...params.config,
    };
    const mode: 'reportOnly' | 'full' = config.mode ?? 'full';
    const maxIterations = mode === 'reportOnly' ? 1 : config.maxIterations;
    const visualizationTool = new VisualizationTool();

    // Commit initial generated code before validation loop starts
    await performCommit(workspace.app, undefined, 'initial');

    // Launch agent handles: pnpm i, build, fix errors, AND start dev server
    const result = await launch(workspace.app);
    if (!result.success) {
        throw new Error(result.error ?? 'Launch failed');
    }

    // Launch agent now returns server metadata
    if (!result.serverKey || !result.url || !result.port) {
        throw new Error('Launch agent did not return server metadata (serverKey, url, port)');
    }

    const currentServerUrl = result.url;
    const serverKey = result.serverKey;

    try {
        // Extract unified validation context from protocol (single traversal)
        const validationContext = extractValidationContext(protocol);
        const designOffset: [number, number] = [validationContext.offset.x, validationContext.offset.y];
        if (Math.abs(designOffset[0]) >= 1 || Math.abs(designOffset[1]) >= 1) {
            logger.printInfoLog(`Design offset: (${designOffset[0].toFixed(0)}, ${designOffset[1].toFixed(0)} px)`);
        }

        // Extract component paths from context (already resolved to absolute filesystem paths)
        const resolvedComponentPaths = extractComponentPaths(validationContext, workspace);

        // Build element registry for compatibility with existing APIs
        const elementRegistry = toElementMetadataRegistry(validationContext);

        // Download and cache Figma thumbnail once to avoid redundant downloads in each iteration
        logger.printInfoLog('Downloading Figma thumbnail (will be cached for all iterations)...');
        const cachedFigmaThumbnailBase64 = await downloadImage(figmaThumbnailUrl, undefined, undefined, true);
        logger.printSuccessLog('Figma thumbnail cached successfully');

        const iterations: IterationLog[] = [];
        const componentHistory: ComponentHistory = {};
        let previousScreenshotPath: string | undefined;
        let currentMae = -1; // Sentinel value: -1 indicates no measurement yet
        let currentSae = 0;
        let lastMisalignedCount = 0;
        let lastValidationResult: ValidationIterationResult | undefined;
        // Track paths to last iteration's individual screenshots for report reuse
        let lastRenderMarkedPath: string | undefined;
        let lastTargetMarkedPath: string | undefined;

        for (let iteration = 1; iteration <= maxIterations; iteration++) {
            logger.printLog(`\n${'='.repeat(60)}`);
            logger.printLog(`Iteration ${iteration}/${maxIterations}`);
            logger.printLog(`${'='.repeat(60)}`);

            const validationResult = await validatePositions({
                serverUrl: currentServerUrl,
                figmaThumbnailUrl,
                protocol,
                iteration,
                positionThreshold: config.positionThreshold,
                designOffset,
                outputDir,
                validationContext,
                elementRegistry,
                cachedFigmaThumbnailBase64,
                resolvedComponentPaths,
            });

            // Store for final report generation
            lastValidationResult = validationResult;

            currentMae = validationResult.mae;
            currentSae = validationResult.sae;
            const misaligned = validationResult.misalignedComponents;
            lastMisalignedCount = misaligned.length;

            logger.printInfoLog(`MAE: ${currentMae.toFixed(2)}px (target: <=${config.targetMae}px)`);
            logger.printInfoLog(`SAE: ${currentSae.toFixed(2)}px`);
            logger.printInfoLog(`Misaligned: ${misaligned.length}`);

            // Generate iteration screenshot using VisualizationTool
            const screenshotResult = await visualizationTool.generateIterationScreenshot(
                misaligned,
                currentServerUrl,
                figmaThumbnailUrl,
                validationResult.viewport,
                { x: designOffset[0], y: designOffset[1] },
                path.join(outputDir, 'comparison_screenshots', `iteration_${iteration}.webp`),
                cachedFigmaThumbnailBase64
            );

            // Save individual annotated screenshots to disk for report reuse
            if (screenshotResult.renderMarked && screenshotResult.targetMarked) {
                const comparisonDir = path.join(outputDir, 'comparison_screenshots');
                lastRenderMarkedPath = path.join(comparisonDir, `iteration_${iteration}_render_marked.webp`);
                lastTargetMarkedPath = path.join(comparisonDir, `iteration_${iteration}_target_marked.webp`);

                const sharp = (await import('sharp')).default;
                await sharp(Buffer.from(screenshotResult.renderMarked.split(',')[1]!, 'base64')).toFile(lastRenderMarkedPath);
                await sharp(Buffer.from(screenshotResult.targetMarked.split(',')[1]!, 'base64')).toFile(lastTargetMarkedPath);
            }

            // Use combined screenshot for judger visual context in next iteration
            const comparisonScreenshotPath = screenshotResult.combinedPath;
            previousScreenshotPath = comparisonScreenshotPath; // Pass to judger in next iteration

            const misalignedToFix = filterComponentsToFix(misaligned, config.positionThreshold);
            logger.printInfoLog(
                `Skipping ${misaligned.length - misalignedToFix.length} components with error <= ${config.positionThreshold}px`
            );

            for (const comp of misalignedToFix) {
                recordComponentPosition(comp, iteration, componentHistory);
            }

            const componentLogs: ComponentCorrectionLog[] = [];

            if (mode === 'reportOnly') {
                logger.printInfoLog('Report-only mode enabled: skipping judger/refiner iterations and code edits.');

                saveIterationAndProcessedJson(
                    iterations,
                    iteration,
                    currentMae,
                    currentSae,
                    misaligned.length,
                    componentLogs,
                    comparisonScreenshotPath,
                    validationResult.skippedElements,
                    outputDir,
                    config.targetMae
                );
                break;
            }

            if (currentMae <= config.targetMae) {
                logger.printSuccessLog('Validation passed!');

                saveIterationAndProcessedJson(
                    iterations,
                    iteration,
                    currentMae,
                    currentSae,
                    misaligned.length,
                    componentLogs,
                    comparisonScreenshotPath,
                    validationResult.skippedElements,
                    outputDir,
                    config.targetMae
                );

                if (serverKey) {
                    await performCommit(workspace.app, iteration, `iteration ${iteration}`);
                }
                break;
            }

            logger.printInfoLog(`Refining ${misalignedToFix.length} components...`);

            const refinementContext: RefinementContext = {
                workspace,
                structureTree: protocol as unknown as Dict,
                componentPaths: resolvedComponentPaths,
                componentHistory,
                validationContext,
                previousScreenshotPath,
            };

            for (const comp of misalignedToFix) {
                const log = await refineComponent(comp, refinementContext);
                componentLogs.push(log);
            }

            // Commit refiner changes (component fixes)
            if (mode === 'full') {
                await performCommit(workspace.app, iteration, `refiner (iteration ${iteration})`);
            }

            saveIterationAndProcessedJson(
                iterations,
                iteration,
                currentMae,
                currentSae,
                misaligned.length,
                componentLogs,
                comparisonScreenshotPath,
                validationResult.skippedElements,
                outputDir,
                config.targetMae
            );

            if (serverKey) {
                await performCommit(workspace.app, iteration, `iteration ${iteration}`);
            }

            logger.printInfoLog(`Iteration ${iteration} complete\n`);
        }

        const validationPassed = currentMae <= config.targetMae;
        if (!validationPassed) {
            if (mode === 'reportOnly') {
                logger.printWarnLog(
                    `Validation did not satisfy MAE threshold (${config.targetMae}px) in report-only mode. Final MAE: ${currentMae.toFixed(2)}px`
                );
            } else {
                logger.printWarnLog(
                    `Max iterations (${maxIterations}) reached without satisfying MAE threshold (${config.targetMae}px). Final MAE: ${currentMae.toFixed(2)}px`
                );
            }
        }

        const finalOutput: ProcessedOutput = {
            iterations,
            finalResult: {
                success: validationPassed,
                finalMae: currentMae,
                finalSae: currentSae,
                totalIterations: iterations.length,
                misalignedCount: lastMisalignedCount,
            },
        };

        // Generate final validation report using report() subnode
        try {
            if (!lastValidationResult) {
                throw new Error('No validation results available for report generation');
            }

            // Validate that we have saved screenshots
            if (!lastRenderMarkedPath || !lastTargetMarkedPath) {
                throw new Error('No saved screenshots available for report generation');
            }

            const reportResult = await report({
                validationResult: lastValidationResult,
                figmaThumbnailUrl,
                cachedFigmaThumbnailBase64,
                designOffset: { x: designOffset[0], y: designOffset[1] },
                outputDir,
                serverUrl: currentServerUrl,
                savedRenderMarkedPath: lastRenderMarkedPath,
                savedTargetMarkedPath: lastTargetMarkedPath,
            });

            // Update misaligned count from final report (may differ from last iteration)
            finalOutput.finalResult.misalignedCount = lastValidationResult.misalignedComponents.length;
            saveProcessedJson(outputDir, finalOutput);

            return {
                reportGenerated: reportResult.success,
                validationPassed,
                finalMae: currentMae,
                finalSae: currentSae,
                totalIterations: iterations.length,
                processedOutput: finalOutput,
                userReport: reportResult.userReport,
            };
        } catch (screenshotError) {
            const errorMsg = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
            logger.printWarnLog(`Failed to generate final report: ${errorMsg}. Returning minimal report.`);
            saveProcessedJson(outputDir, finalOutput);

            // Fallback: create minimal report
            return {
                reportGenerated: false,
                validationPassed,
                finalMae: currentMae,
                finalSae: currentSae,
                totalIterations: iterations.length,
                processedOutput: finalOutput,
                userReport: {
                    design: { snap: figmaThumbnailUrl, markedSnap: '' },
                    page: { url: currentServerUrl, snap: '', markedSnap: '' },
                    report: {
                        heatmap: '',
                        detail: {
                            metrics: { mae: currentMae, sae: currentSae, misalignedCount: lastMisalignedCount },
                            components: [],
                        },
                    },
                },
            };
        }
    } finally {
        // Cleanup: Stop dev server if it was started by this validation loop
        if (serverKey) {
            logger.printInfoLog('Cleaning up dev server...');
            const launchTool = new LaunchTool();
            await launchTool.stopDevServer(serverKey).catch((err: unknown) => {
                logger.printWarnLog(`Failed to stop dev server: ${err instanceof Error ? err.message : String(err)}`);
            });
        }
    }
}
