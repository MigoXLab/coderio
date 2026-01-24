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
import { commit } from '../subnodes/commit/index';
import { createJudgerAgent, formatJudgerInstruction } from '../../../agents/judger-agent';
import { createRefinerAgent, formatRefinerInstruction } from '../../../agents/refiner-agent';
import { launch } from '../subnodes/launch/index';
import type {
    ComponentCorrectionLog,
    ComponentHistory,
    Dict,
    IterationLog,
    JudgerDiagnosis,
    MisalignedComponent,
    ProcessedOutput,
    RefinerResult,
    RefinementContext,
    ValidationIterationResult,
    ValidationLoopConfig,
    ValidationLoopParams,
    ValidationLoopResult,
} from '../types';
import { extractLayoutFromContext } from '../utils/extraction/extract-layout-metadata';
import { report } from '../subnodes/report/index';
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
    const launchTool = new LaunchTool();
    const visualizationTool = new VisualizationTool();

    // Commit initial generated code before validation loop starts
    const initialCommit = await commit({
        repoPath: workspace.app,
        // iteration is undefined → agent treats as initial commit
    });
    if (!initialCommit.success) {
        logger.printWarnLog(`Git commit (initial) failed: ${initialCommit.message}`);
    } else {
        logger.printSuccessLog(`Initial project committed successfully, starting validation loop...`);
    }

    const result = await launch(workspace.app);
    if (!result.success) {
        throw new Error(result.error);
    }

    const serverRes = await launchTool.startDevServer(workspace.app, 'npm run dev', 60000);
    if (!serverRes.success || !serverRes.url || !serverRes.port || !serverRes.serverKey) {
        throw new Error(serverRes.error ?? 'Failed to start dev server.');
    }

    const currentServerUrl = serverRes.url;
    const serverKey = serverRes.serverKey;

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
            const comparisonScreenshotPath = await visualizationTool.generateIterationScreenshot(
                misaligned,
                currentServerUrl,
                figmaThumbnailUrl,
                validationResult.viewport,
                { x: designOffset[0], y: designOffset[1] },
                path.join(outputDir, 'comparison_screenshots', `iteration_${iteration}.webp`),
                cachedFigmaThumbnailBase64
            );

            logger.printInfoLog(`MAE: ${currentMae.toFixed(2)}px (target: <=${config.targetMae}px)`);
            logger.printInfoLog(`SAE: ${currentSae.toFixed(2)}px`);
            logger.printInfoLog(`Misaligned: ${misaligned.length}`);

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

                iterations.push({
                    iteration,
                    metrics: { mae: currentMae, sae: currentSae, misalignedCount: misaligned.length },
                    components: componentLogs,
                    screenshotPath: comparisonScreenshotPath,
                    skippedElements: validationResult.skippedElements.length > 0 ? validationResult.skippedElements : undefined,
                });
                saveProcessedJson(outputDir, {
                    iterations,
                    finalResult: {
                        success: currentMae <= config.targetMae,
                        finalMae: currentMae,
                        finalSae: currentSae,
                        totalIterations: iterations.length,
                        misalignedCount: misaligned.length,
                    },
                });
                break;
            }

            if (currentMae <= config.targetMae) {
                logger.printSuccessLog('Validation passed!');
                iterations.push({
                    iteration,
                    metrics: { mae: currentMae, sae: currentSae, misalignedCount: misaligned.length },
                    components: componentLogs,
                    screenshotPath: comparisonScreenshotPath,
                    skippedElements: validationResult.skippedElements.length > 0 ? validationResult.skippedElements : undefined,
                });
                saveProcessedJson(outputDir, {
                    iterations,
                    finalResult: {
                        success: true,
                        finalMae: currentMae,
                        finalSae: currentSae,
                        totalIterations: iterations.length,
                        misalignedCount: misaligned.length,
                    },
                });

                if (serverKey) {
                    const buildCheck = await launch(workspace.app);
                    if (!buildCheck.success) {
                        throw new Error(buildCheck.error);
                    }
                    // Commit final iteration changes
                    const iterationCommit = await commit({
                        repoPath: workspace.app,
                        iteration,
                    });
                    if (!iterationCommit.success) {
                        logger.printWarnLog(`Git commit (iteration ${iteration}) failed: ${iterationCommit.message}`);
                    }
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
                const refinerCommit = await commit({
                    repoPath: workspace.app,
                    iteration,
                });
                if (!refinerCommit.success) {
                    logger.printWarnLog(`Git commit after refiner (iteration ${iteration}) failed: ${refinerCommit.message}`);
                }
            }

            iterations.push({
                iteration,
                metrics: { mae: currentMae, sae: currentSae, misalignedCount: misaligned.length },
                components: componentLogs,
                screenshotPath: comparisonScreenshotPath,
                skippedElements: validationResult.skippedElements.length > 0 ? validationResult.skippedElements : undefined,
            });

            saveProcessedJson(outputDir, {
                iterations,
                finalResult: {
                    success: currentMae <= config.targetMae,
                    finalMae: currentMae,
                    finalSae: currentSae,
                    totalIterations: iterations.length,
                    misalignedCount: misaligned.length,
                },
            });

            if (serverKey) {
                const buildCheck = await launch(workspace.app);
                if (!buildCheck.success) {
                    throw new Error(buildCheck.error);
                }
                // Commit launch changes (build error fixes)
                const launchCommit = await commit({
                    repoPath: workspace.app,
                    iteration,
                });
                if (!launchCommit.success) {
                    logger.printWarnLog(`Git commit after launch (iteration ${iteration}) failed: ${launchCommit.message}`);
                }
            }

            logger.printInfoLog(`Iteration ${iteration} complete\n`);
            previousScreenshotPath = comparisonScreenshotPath;
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

            const reportResult = await report({
                validationResult: lastValidationResult,
                figmaThumbnailUrl,
                cachedFigmaThumbnailBase64,
                designOffset: { x: designOffset[0], y: designOffset[1] },
                outputDir,
                serverUrl: currentServerUrl,
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
            await launchTool.stopDevServer(serverKey).catch((err: unknown) => {
                logger.printWarnLog(`Failed to stop dev server: ${err instanceof Error ? err.message : String(err)}`);
            });
        }
    }
}
