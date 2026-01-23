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
import type { WorkspaceStructure } from '../../../types/workspace-types';
import { commit } from '../subnodes/commit/index';
import { createJudgerAgent, formatJudgerInstruction } from '../../../agents/judger-agent';
import { createRefinerAgent, formatRefinerInstruction } from '../../../agents/refiner-agent';
import { launch } from '../subnodes/launch/index';
import type {
    ComponentCorrectionLog,
    ComponentHistory,
    IterationLog,
    JudgerDiagnosis,
    MisalignedComponent,
    ProcessedOutput,
    RefinerResult,
    ValidationLoopConfig,
    ValidationLoopParams,
    ValidationLoopResult,
} from '../types';
import { extractLayoutFromContext } from '../utils/extraction/extract-layout-metadata';
import { report } from '../subnodes/report/index';
import { ReportTool } from '../../../tools/report-tool';
import { LaunchTool } from '../../../tools/launch-tool';
import { type Dict } from '../utils/tree/tree-traversal';
import { extractValidationContext, extractComponentPaths, toElementMetadataRegistry } from '../utils/extraction/extract-protocol-context';
import type { ValidationContext } from '../../../types/validation-types';
import { validatePositions } from './validate-position';

interface RefinementContext {
    workspace: WorkspaceStructure;
    structureTree: Dict;
    componentPaths: Record<string, string>;
    componentHistory: ComponentHistory;
    validationContext: ValidationContext;
    previousScreenshotPath?: string;
}

function calculateSae(misaligned: MisalignedComponent[]): number {
    return misaligned.reduce((sum, comp) => {
        const [errorX, errorY] = comp.validationReport.absoluteError;
        return sum + errorX + errorY;
    }, 0);
}

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
            .filter(e => e.parentComponentId === comp.componentId)
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

/**
 * Download and cache Figma thumbnail as base64.
 * This prevents redundant downloads during the validation loop.
 */
async function downloadFigmaThumbnail(figmaThumbnailUrl: string): Promise<string> {
    logger.printInfoLog('Downloading Figma thumbnail (will be cached for all iterations)...');
    const axios = (await import('axios')).default;
    const response = await axios.get(figmaThumbnailUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const base64 = Buffer.from(response.data).toString('base64');
    logger.printSuccessLog('Figma thumbnail cached successfully');
    return base64;
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
    const reportTool = new ReportTool();

    const preCommit = await commit({
        repoPath: workspace.app,
        commitMessage: `start validation loop`,
        allowEmpty: true,
    });
    if (!preCommit.success) {
        logger.printWarnLog(`Git commit (start validation loop) failed: ${preCommit.message}`);
    } else {
        logger.printSuccessLog(`Initial project has been committed successfully, starting validation loop...`);
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
        const cachedFigmaThumbnailBase64 = await downloadFigmaThumbnail(figmaThumbnailUrl);

        const iterations: IterationLog[] = [];
        const componentHistory: ComponentHistory = {};
        let previousScreenshotPath: string | undefined;
        let currentMae = -1; // Sentinel value: -1 indicates no measurement yet
        let currentSae = 0;
        let lastMisalignedCount = 0;

        for (let iteration = 1; iteration <= maxIterations; iteration++) {
            logger.printLog(`\n${'='.repeat(60)}`);
            logger.printLog(`Iteration ${iteration}/${maxIterations}`);
            logger.printLog(`${'='.repeat(60)}`);

            if (mode === 'full') {
                const startCommit = await commit({
                    repoPath: workspace.app,
                    commitMessage: `start iteration ${iteration}`,
                    allowEmpty: true,
                });
                if (!startCommit.success) {
                    logger.printWarnLog(`Git commit (start iteration ${iteration}) failed: ${startCommit.message}`);
                }
            }

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

            currentMae = validationResult.mae;
            const misaligned = validationResult.misalignedComponents;
            lastMisalignedCount = misaligned.length;
            currentSae = calculateSae(misaligned);

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
                    screenshotPath: validationResult.comparisonScreenshotPath,
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
                    screenshotPath: validationResult.comparisonScreenshotPath,
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
                    const endCommit = await commit({
                        repoPath: workspace.app,
                        commitMessage: `end iteration ${iteration}`,
                        allowEmpty: true,
                    });
                    if (!endCommit.success) {
                        logger.printWarnLog(`Git commit (end iteration ${iteration}) failed: ${endCommit.message}`);
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

            iterations.push({
                iteration,
                metrics: { mae: currentMae, sae: currentSae, misalignedCount: misaligned.length },
                components: componentLogs,
                screenshotPath: validationResult.comparisonScreenshotPath,
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
                const endCommit = await commit({
                    repoPath: workspace.app,
                    commitMessage: `end iteration ${iteration}`,
                    allowEmpty: true,
                });
                if (!endCommit.success) {
                    logger.printWarnLog(`Git commit (end iteration ${iteration}) failed: ${endCommit.message}`);
                }
            }

            logger.printInfoLog(`Iteration ${iteration} complete\n`);
            previousScreenshotPath = validationResult.comparisonScreenshotPath;
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

        try {
            // Step 1: Build userReport with screenshots (replaces generateFinalReport)
            const reportResult = await reportTool.buildUserReport({
                protocol,
                serverUrl: currentServerUrl,
                figmaThumbnailUrl,
                outputDir,
                designOffset: { x: designOffset[0], y: designOffset[1] },
                finalMae: currentMae,
                finalSae: currentSae,
                positionThreshold: config.positionThreshold,
                validationContext,
                elementRegistry,
                cachedFigmaThumbnailBase64,
            });

            finalOutput.finalResult.misalignedCount = reportResult.misalignedCount;
            saveProcessedJson(outputDir, finalOutput);

            // Step 2: Generate HTML file from userReport (NEW - happens inside validation)
            const htmlResult = await report({
                userReport: reportResult.userReport,
                outputDir,
            });

            if (!htmlResult.success) {
                logger.printWarnLog(`Failed to generate HTML report: ${htmlResult.error}`);
            }

            return {
                reportGenerated: htmlResult.success,
                validationPassed,
                finalMae: currentMae,
                finalSae: currentSae,
                totalIterations: iterations.length,
                processedOutput: finalOutput,
                userReport: reportResult.userReport,
            };
        } catch (screenshotError) {
            const errorMsg = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
            logger.printWarnLog(`Failed to generate final screenshots: ${errorMsg}. Returning minimal report.`);
            saveProcessedJson(outputDir, finalOutput);

            return {
                reportGenerated: false,
                validationPassed,
                finalMae: currentMae,
                finalSae: currentSae,
                totalIterations: iterations.length,
                processedOutput: finalOutput,
                userReport: reportTool.createMinimalReport({
                    serverUrl: currentServerUrl,
                    figmaThumbnailUrl,
                    mae: currentMae,
                    sae: currentSae,
                }),
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
