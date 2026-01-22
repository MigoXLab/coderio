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
import { commit } from '../subnodes/commit/index.js';
import { createJudgerAgent, formatJudgerInstruction } from '../../../agents/judger-agent';
import { createRefinerAgent, formatRefinerInstruction } from '../../../agents/refiner-agent';
import { checkAndFix } from '../subnodes/launch/index.js';
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
import { extractLayoutFromContext } from '../utils/extraction/extract-layout-metadata.js';
import { report } from '../subnodes/report/index.js';
import { ReportTool } from '../../../tools/report-tool';
import { LaunchTool } from '../../../tools/launch-tool';
import { type Dict } from '../utils/tree/tree-traversal.js';
import {
    extractValidationContext,
    extractComponentPaths,
    toElementMetadataRegistry,
} from '../utils/extraction/extract-protocol-context.js';
import type { ValidationContext } from '../../../types/validation-types.js';
import { validatePositions } from './validate-position';

interface RefinementContext {
    workspaceDir?: string;
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

/**
 * Resolve component paths from @/components aliases to absolute filesystem paths.
 * All components follow the pattern: {workspaceDir}/src/components/{name}/index.tsx
 */
function resolveComponentPaths(componentPaths: Record<string, string>, workspaceDir: string): Record<string, string> {
    const resolved: Record<string, string> = {};

    for (const [componentId, aliasPath] of Object.entries(componentPaths)) {
        // Convert @/components/name → src/components/name
        const srcRelativePath = aliasPath.replace(/^@\//, 'src/');

        // Append index.tsx (all components follow this pattern)
        const fullRelativePath = `${srcRelativePath}/index.tsx`;

        // Resolve to absolute path
        const absolutePath = path.join(workspaceDir, fullRelativePath);

        resolved[componentId] = absolutePath;
    }

    return resolved;
}

async function refineComponent(comp: MisalignedComponent, context: RefinementContext): Promise<ComponentCorrectionLog> {
    const { workspaceDir, structureTree, componentPaths, componentHistory, validationContext, previousScreenshotPath } = context;

    try {
        // Extract element IDs from context for this component
        const elementIds = Array.from(validationContext.elements.values())
            .filter(e => e.parentComponentId === comp.componentId)
            .map(e => e.id);

        const figmaMetadata = extractLayoutFromContext(validationContext, comp.componentId, elementIds);

        logger.printLog(`  Analyzing ${comp.name}...`);
        const judger = createJudgerAgent({
            workspaceDir,
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
        const refiner = createRefinerAgent(workspaceDir);
        const refinerInstruction = formatRefinerInstruction(comp, diagnosis);
        const refinerResult = (await refiner.run(refinerInstruction)) as RefinerResult;

        const status = refinerResult.success ? 'SUCCESS' : 'FAILED';
        logger.printLog(`  ${status} ${comp.name}: ${refinerResult.editsApplied} edits applied`);

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
    logger.printLog('Saved processed.json');
}

/**
 * Download and cache Figma thumbnail as base64.
 * This prevents redundant downloads during the validation loop.
 */
async function downloadFigmaThumbnail(figmaThumbnailUrl: string): Promise<string> {
    logger.printLog('Downloading Figma thumbnail (will be cached for all iterations)...');
    const axios = (await import('axios')).default;
    const response = await axios.get(figmaThumbnailUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const base64 = Buffer.from(response.data).toString('base64');
    logger.printLog('Figma thumbnail cached successfully');
    return base64;
}

export async function validationLoop(params: ValidationLoopParams): Promise<ValidationLoopResult> {
    const { protocol, figmaThumbnailUrl, outputDir, workspaceDir } = params;

    if (!protocol || !figmaThumbnailUrl || !outputDir || !workspaceDir) {
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
        repoPath: workspaceDir,
        commitMessage: `start validation loop`,
        allowEmpty: true,
    });
    if (!preCommit.success) {
        logger.printWarnLog(`Git commit (start validation loop) failed: ${preCommit.message}`);
    } else {
        logger.printSuccessLog(`Initial project has been committed successfully, starting validation loop...`);
    }

    const result = await checkAndFix(workspaceDir);
    if (!result.success) {
        throw new Error(result.error);
    }

    const serverRes = await launchTool.startDevServer(workspaceDir, 'npm run dev', 60000);
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
            logger.printLog(`Design offset: (${designOffset[0].toFixed(0)}, ${designOffset[1].toFixed(0)} px)`);
        }

        // Extract component paths from context
        const componentPaths = extractComponentPaths(validationContext);

        // Resolve alias paths to absolute filesystem paths when workspaceDir available
        const resolvedComponentPaths = workspaceDir ? resolveComponentPaths(componentPaths, workspaceDir) : componentPaths;

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
                if (workspaceDir) {
                    const startCommit = await commit({
                        repoPath: workspaceDir,
                        commitMessage: `start iteration ${iteration}`,
                        allowEmpty: true,
                    });
                    if (!startCommit.success) {
                        logger.printWarnLog(`Git commit (start iteration ${iteration}) failed: ${startCommit.message}`);
                    }
                } else {
                    logger.printWarnLog('workspaceDir not provided; skipping git commit markers for this iteration');
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
            });

            currentMae = validationResult.mae;
            const misaligned = validationResult.misalignedComponents;
            lastMisalignedCount = misaligned.length;
            currentSae = calculateSae(misaligned);

            logger.printLog(`MAE: ${currentMae.toFixed(2)}px (target: <=${config.targetMae}px)`);
            logger.printLog(`SAE: ${currentSae.toFixed(2)}px`);
            logger.printLog(`Misaligned: ${misaligned.length}`);

            const misalignedToFix = filterComponentsToFix(misaligned, config.positionThreshold);
            logger.printLog(
                `Skipping ${misaligned.length - misalignedToFix.length} components with error <= ${config.positionThreshold}px`
            );

            for (const comp of misalignedToFix) {
                recordComponentPosition(comp, iteration, componentHistory);
            }

            const componentLogs: ComponentCorrectionLog[] = [];

            if (mode === 'reportOnly') {
                logger.printLog('Report-only mode enabled: skipping judger/refiner iterations and code edits.');

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
                logger.printLog('Validation passed!');
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

                if (workspaceDir && serverKey) {
                    const buildCheck = await checkAndFix(workspaceDir);
                    if (!buildCheck.success) {
                        throw new Error(buildCheck.error);
                    }
                    const endCommit = await commit({
                        repoPath: workspaceDir,
                        commitMessage: `end iteration ${iteration}`,
                        allowEmpty: true,
                    });
                    if (!endCommit.success) {
                        logger.printWarnLog(`Git commit (end iteration ${iteration}) failed: ${endCommit.message}`);
                    }
                }
                break;
            }

            logger.printLog(`Refining ${misalignedToFix.length} components...`);

            const refinementContext: RefinementContext = {
                workspaceDir,
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

            if (workspaceDir && serverKey) {
                const buildCheck = await checkAndFix(workspaceDir);
                if (!buildCheck.success) {
                    throw new Error(buildCheck.error);
                }
                const endCommit = await commit({
                    repoPath: workspaceDir,
                    commitMessage: `end iteration ${iteration}`,
                    allowEmpty: true,
                });
                if (!endCommit.success) {
                    logger.printWarnLog(`Git commit (end iteration ${iteration}) failed: ${endCommit.message}`);
                }
            }

            logger.printLog(`Iteration ${iteration} complete\n`);
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

            // Preserve actual validation status even when screenshot generation fails
            const validationPassed = currentMae <= config.targetMae;

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
            logger.printLog('Cleaning up dev server...');
            await launchTool.stopDevServer(serverKey).catch((err: unknown) => {
                logger.printWarnLog(`Failed to stop dev server: ${err instanceof Error ? err.message : String(err)}`);
            });
        }
    }
}
