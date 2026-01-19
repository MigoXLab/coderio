import * as path from 'path';

import { logger } from '../../../../utils/logger';

import type { LaunchOptions, LaunchResult } from '../../types';
import { createLaunchAgent, formatLaunchAgentInstruction } from '../../../../agents/launch-agent';
import { LaunchTool } from '../../../../tools/launch-tool';

function resolveRepoPath(options: LaunchOptions = {}): string {
    if (!options.repoPath) {
        throw new Error('launchLoop() requires options.repoPath in coderio.');
    }
    return path.resolve(options.repoPath);
}

function buildRuntimeErrorContext(params: {
    overlayText: string;
    isBlank: boolean;
    rootSummary: { childCount: number; textLength: number; htmlSnippet: string };
    consoleErrors: string[];
    pageErrors: string[];
    serverOutputTail?: string;
}): string {
    const sections: string[] = [];
    if (params.overlayText.trim().length > 0) {
        sections.push(`VITE_OVERLAY:\n${params.overlayText.trim()}`);
    }
    sections.push(`ROOT_BLANK: ${params.isBlank}`);
    sections.push(
        `ROOT_SUMMARY: childCount=${params.rootSummary.childCount} textLength=${params.rootSummary.textLength}\nHTML_SNIPPET:\n${params.rootSummary.htmlSnippet}`
    );
    if (params.pageErrors.length > 0) {
        sections.push(`PAGE_ERRORS:\n${params.pageErrors.join('\n')}`);
    }
    if (params.consoleErrors.length > 0) {
        sections.push(`CONSOLE_ERRORS:\n${params.consoleErrors.join('\n')}`);
    }
    if (params.serverOutputTail) {
        sections.push(`DEV_SERVER_OUTPUT_TAIL:\n${params.serverOutputTail}`);
    }
    return sections.join('\n\n').trim();
}

function extractMissingPreprocessorDependencies(log: string): string[] {
    const pattern = /Preprocessor dependency ["']([^"']+)["'] not found/gi;
    const deps: string[] = [];
    let match;
    while ((match = pattern.exec(log)) !== null) {
        const dep = match[1]?.trim();
        if (dep && !deps.includes(dep)) {
            deps.push(dep);
        }
    }
    return deps;
}

/**
 * Launch loop orchestration (deterministic LaunchTool + optional LaunchAgent assistance).
 *
 * Flow:
 * install → (build + agent)* → start → (runtimeDiagnostics + agent + restart)*
 */
export async function launchLoop(options: LaunchOptions = {}): Promise<LaunchResult> {
    const repoPath = resolveRepoPath(options);
    const runCommand = (options.runCommand ?? 'npm run dev').trim();
    const buildCommand = (options.buildCommand ?? 'npm run build').trim();
    const mode = options.mode ?? 'full';

    // Defensive casts: options may come from non-typed call sites.
    const maxBuildAttempts = options.maxBuildAttempts ?? 3;
    const maxRuntimeAttempts = options.maxRuntimeAttempts ?? 2;

    const installTimeoutMs = options.installTimeoutMs ?? 180_000;
    const buildTimeoutMs = options.buildTimeoutMs ?? 180_000;
    const serverStartTimeoutMs = options.serverStartTimeoutMs ?? 60_000;
    const runtimeCheckTimeoutMs = options.runtimeCheckTimeoutMs ?? 45_000;
    const viewport = options.viewport ?? { width: 1365, height: 768 };

    // Skip install when reusing an existing server in buildOnly mode
    const skipInstall = mode === 'buildOnly' && options.serverKey !== undefined;

    logger.printLog('═══════════════════════════════════════════════════════');
    logger.printLog(`🚀 Starting Launch Process`);
    logger.printLog(`📂 Repository: ${path.basename(repoPath)}`);
    logger.printLog(`⚙️  Mode: ${mode}`);
    logger.printLog(`🔧 Build Command: ${buildCommand}`);
    if (mode !== 'buildOnly') {
        logger.printLog(`▶️  Run Command: ${runCommand}`);
    }
    logger.printLog('═══════════════════════════════════════════════════════');

    try {
        const launchTool = new LaunchTool();
        const agent = createLaunchAgent();

        // Step 1: Install (skip if reusing server in buildOnly mode)
        if (!skipInstall) {
            logger.printLog('📦 [1/4] Installing dependencies...');
            const installRes = await launchTool.installDependencies(repoPath, installTimeoutMs);
            if (!installRes.success) {
                logger.printErrorLog('❌ Dependency installation failed');
                logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.printErrorLog(installRes.error ?? 'Unknown installation error');
                if (installRes.combined?.trim()) {
                    logger.printErrorLog('\n📋 Installation Output:');
                    logger.printErrorLog(installRes.combined);
                }
                return {
                    success: false,
                    repoPath,
                    buildAgentIterations: 0,
                    runtimeAgentIterations: 0,
                    error: `Dependency installation failed.\n${installRes.error ?? ''}\n${installRes.combined}`,
                };
            }
            logger.printSuccessLog('✅ Dependencies installed successfully');
        } else {
            logger.printLog('📦 [1/4] Skipping dependency installation (reusing existing server)');
        }

        // Step 2/3: Build + agent loop
        logger.printLog('');
        logger.printLog('🏗️  [2/4] Building project...');
        let buildAgentIterations = 0;
        let buildSucceeded = false;
        for (let attempt = 0; attempt < maxBuildAttempts; attempt++) {
            logger.printLog(`   Attempt ${attempt + 1}/${maxBuildAttempts}`);
            const buildRes = await launchTool.buildProject(repoPath, buildCommand, buildTimeoutMs);
            if (buildRes.success) {
                buildSucceeded = true;
                logger.printSuccessLog(`✅ Build succeeded (attempt ${attempt + 1}/${maxBuildAttempts})`);
                break;
            }

            logger.printWarnLog(`⚠️  Build failed on attempt ${attempt + 1}/${maxBuildAttempts}`);

            if (attempt === maxBuildAttempts - 1) {
                logger.printErrorLog('');
                logger.printErrorLog('❌ Build failed after all attempts');
                logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.printErrorLog(`📊 Summary:`);
                logger.printErrorLog(`   • Build attempts: ${maxBuildAttempts}`);
                logger.printErrorLog(`   • Agent iterations: ${buildAgentIterations}`);
                logger.printErrorLog('');
                logger.printErrorLog('📋 Build Output:');
                logger.printErrorLog(buildRes.combined);
                return {
                    success: false,
                    repoPath,
                    buildAgentIterations,
                    runtimeAgentIterations: 0,
                    error: `Build failed after ${buildAgentIterations} LaunchAgent attempt(s).\n\n${buildRes.combined}`,
                };
            }

            // If missing, install and retry the build rather than invoking LaunchAgent.
            const missingPreprocessors = extractMissingPreprocessorDependencies(buildRes.combined);
            if (missingPreprocessors.length > 0) {
                logger.printLog(`🧩 Detected missing preprocessor dependencies: ${missingPreprocessors.join(', ')}`);
                logger.printLog('   Installing missing dependencies and retrying...');
                for (const dep of missingPreprocessors) {
                    const depRes = await launchTool.installDevDependency(repoPath, dep, installTimeoutMs);
                    if (!depRes.success) {
                        logger.printErrorLog(`❌ Failed to install dev dependency: ${dep}`);
                        logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        logger.printErrorLog(depRes.combined || depRes.error || '');
                        return {
                            success: false,
                            repoPath,
                            buildAgentIterations,
                            runtimeAgentIterations: 0,
                            error: `Failed to install dev dependency "${dep}".\n${depRes.combined || depRes.error || ''}`.trim(),
                        };
                    }
                    logger.printSuccessLog(`   ✅ Installed: ${dep}`);
                }
                continue;
            }

            const primaryFileDisplay = buildRes.primaryFile ? path.relative(repoPath, buildRes.primaryFile) : 'No primary file identified';
            logger.printLog(`🤖 Invoking LaunchAgent to fix build errors`);
            logger.printLog(`   Primary file: ${primaryFileDisplay}`);
            logger.printLog(`   Candidate files: ${buildRes.candidateFiles.length}`);

            const agentResult = (await agent.run(
                formatLaunchAgentInstruction({
                    repoPath,
                    stage: 'build',
                    primaryFile: buildRes.primaryFile ?? null,
                    candidateFiles: buildRes.candidateFiles,
                    errorContext: buildRes.combined,
                })
            )) as { success: boolean; summary: string[]; editsApplied?: number };

            // Count the agent call regardless of whether it reports "success".
            // Some runs may apply useful fixes but also report a non-critical failure (e.g. attempted to edit a file that doesn't exist).
            const editsApplied = agentResult.editsApplied ?? 0;
            buildAgentIterations += 1;

            if (!agentResult.success) {
                if (editsApplied > 0) {
                    logger.printWarnLog(`   ⚠️  Agent reported partial failure (${editsApplied} edit(s) applied)`);
                    logger.printLog(`   Continuing to next build attempt...`);
                } else {
                    logger.printWarnLog(`   ⚠️  Agent could not apply any edits`);
                    logger.printLog(`   Continuing to next build attempt...`);
                }
            } else {
                logger.printSuccessLog(`   ✅ Agent applied ${editsApplied} edit(s)`);
            }
        }

        if (!buildSucceeded) {
            return {
                success: false,
                repoPath,
                buildAgentIterations,
                runtimeAgentIterations: 0,
                error: `Build failed after ${buildAgentIterations} LaunchAgent attempt(s).`,
            };
        }

        if (mode === 'buildOnly') {
            if (!options.serverKey) {
                // Pure build-only: no server needed
                logger.printSuccessLog('');
                logger.printSuccessLog('✅ Build-only mode complete (no server start required)');
                return {
                    success: true,
                    repoPath,
                    buildAgentIterations,
                    runtimeAgentIterations: 0,
                };
            }

            // buildOnly + serverKey: restart existing server and validate runtime
            logger.printLog('');
            logger.printLog('🔄 [3/4] Restarting existing server for runtime validation...');

            const restartRes = await launchTool.restartDevServer(options.serverKey, serverStartTimeoutMs);
            if (!restartRes.success || !restartRes.url || !restartRes.port) {
                logger.printErrorLog('❌ Failed to restart dev server');
                logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.printErrorLog(restartRes.error ?? 'Unknown restart error');
                return {
                    success: false,
                    repoPath,
                    buildAgentIterations,
                    runtimeAgentIterations: 0,
                    error: restartRes.error ?? 'Failed to restart dev server in buildOnly mode.',
                };
            }
            logger.printSuccessLog(`✅ Server restarted: ${restartRes.url}`);

            logger.printLog('');
            logger.printLog('🔍 [4/4] Running runtime diagnostics...');
            // Run runtime diagnostics once (no retry loop in buildOnly mode)
            const diag = await launchTool.runtimeDiagnostics(repoPath, restartRes.url, runtimeCheckTimeoutMs, viewport, options.serverKey);
            if (!diag.ok) {
                logger.printErrorLog('❌ Runtime validation failed');
                logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.printErrorLog('📊 Runtime Issues:');
                if (diag.overlayText.trim()) {
                    logger.printErrorLog(`   • Vite Overlay: ${diag.overlayText.trim()}`);
                }
                if (diag.isBlank) {
                    logger.printErrorLog(`   • Page is blank (no content rendered)`);
                }
                if (diag.consoleErrors.length > 0) {
                    logger.printErrorLog(`   • Console Errors (${diag.consoleErrors.length}):`);
                    diag.consoleErrors.slice(0, 5).forEach(err => logger.printErrorLog(`     - ${err}`));
                    if (diag.consoleErrors.length > 5) {
                        logger.printErrorLog(`     ... and ${diag.consoleErrors.length - 5} more`);
                    }
                }
                if (diag.pageErrors.length > 0) {
                    logger.printErrorLog(`   • Page Errors (${diag.pageErrors.length}):`);
                    diag.pageErrors.slice(0, 5).forEach(err => logger.printErrorLog(`     - ${err}`));
                    if (diag.pageErrors.length > 5) {
                        logger.printErrorLog(`     ... and ${diag.pageErrors.length - 5} more`);
                    }
                }
                return {
                    success: false,
                    repoPath,
                    serverUrl: restartRes.url,
                    port: restartRes.port,
                    serverKey: options.serverKey,
                    buildAgentIterations,
                    runtimeAgentIterations: 0,
                    error: `Runtime validation failed in buildOnly mode.\nOverlay: ${diag.overlayText}\nBlank: ${diag.isBlank}\nConsole errors: ${diag.consoleErrors.join('\n')}\nPage errors: ${diag.pageErrors.join('\n')}`,
                };
            }

            logger.printSuccessLog('✅ Runtime validation passed');
            return {
                success: true,
                repoPath,
                serverUrl: restartRes.url,
                port: restartRes.port,
                serverKey: options.serverKey,
                buildAgentIterations,
                runtimeAgentIterations: 0,
            };
        }

        // Step 4: Start dev server (managed child process)
        logger.printLog('');
        logger.printLog('🚀 [3/4] Starting dev server...');
        const serverRes = await launchTool.startDevServer(repoPath, runCommand, serverStartTimeoutMs);
        if (!serverRes.success || !serverRes.url || !serverRes.port || !serverRes.serverKey) {
            logger.printErrorLog('❌ Failed to start dev server');
            logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            logger.printErrorLog(serverRes.error ?? 'Unknown server start error');
            return {
                success: false,
                repoPath,
                buildAgentIterations,
                runtimeAgentIterations: 0,
                error: serverRes.error ?? 'Failed to start dev server.',
            };
        }

        logger.printSuccessLog(`✅ Dev server started: ${serverRes.url} (PID: ${serverRes.pid})`);

        const serverKey = serverRes.serverKey;
        let serverUrl = serverRes.url;
        let serverPort = serverRes.port;
        let serverPid = serverRes.pid;

        // Step 5: Runtime check + agent loop
        logger.printLog('');
        logger.printLog('🔍 [4/4] Validating runtime...');
        for (let runtimeAgentIterations = 0; runtimeAgentIterations < maxRuntimeAttempts; runtimeAgentIterations++) {
            logger.printLog(`   Attempt ${runtimeAgentIterations + 1}/${maxRuntimeAttempts}`);
            const diag = await launchTool.runtimeDiagnostics(repoPath, serverUrl, runtimeCheckTimeoutMs, viewport, serverKey);
            if (diag.ok) {
                logger.printSuccessLog(`✅ Runtime validation passed (attempt ${runtimeAgentIterations + 1}/${maxRuntimeAttempts})`);
                return {
                    success: true,
                    repoPath,
                    serverUrl,
                    port: serverPort,
                    pid: serverPid,
                    serverKey,
                    buildAgentIterations,
                    runtimeAgentIterations,
                };
            }

            logger.printWarnLog(`⚠️  Runtime validation failed on attempt ${runtimeAgentIterations + 1}/${maxRuntimeAttempts}`);

            if (runtimeAgentIterations === maxRuntimeAttempts - 1) {
                await launchTool.stopDevServer(serverKey).catch(() => {});
                logger.printErrorLog('');
                logger.printErrorLog('❌ Runtime validation failed after all attempts');
                logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.printErrorLog('📊 Summary:');
                logger.printErrorLog(`   • Runtime attempts: ${maxRuntimeAttempts}`);
                logger.printErrorLog(`   • Agent iterations: ${runtimeAgentIterations}`);
                logger.printErrorLog('');
                logger.printErrorLog('📋 Runtime Issues:');
                if (diag.overlayText.trim()) {
                    logger.printErrorLog(`   • Vite Overlay:`);
                    logger.printErrorLog(`     ${diag.overlayText.trim()}`);
                }
                if (diag.isBlank) {
                    logger.printErrorLog(`   • Page is blank (no content rendered)`);
                }
                if (diag.consoleErrors.length > 0) {
                    logger.printErrorLog(`   • Console Errors (${diag.consoleErrors.length}):`);
                    diag.consoleErrors.slice(0, 5).forEach(err => logger.printErrorLog(`     - ${err}`));
                    if (diag.consoleErrors.length > 5) {
                        logger.printErrorLog(`     ... and ${diag.consoleErrors.length - 5} more`);
                    }
                }
                if (diag.pageErrors.length > 0) {
                    logger.printErrorLog(`   • Page Errors (${diag.pageErrors.length}):`);
                    diag.pageErrors.slice(0, 5).forEach(err => logger.printErrorLog(`     - ${err}`));
                    if (diag.pageErrors.length > 5) {
                        logger.printErrorLog(`     ... and ${diag.pageErrors.length - 5} more`);
                    }
                }
                return {
                    success: false,
                    repoPath,
                    serverUrl,
                    port: serverPort,
                    pid: serverPid,
                    buildAgentIterations,
                    runtimeAgentIterations,
                    error:
                        `Runtime validation failed after ${runtimeAgentIterations} LaunchAgent attempt(s).\n` +
                        `Overlay: ${diag.overlayText}\n` +
                        `Blank: ${diag.isBlank}\n` +
                        `Console errors: ${diag.consoleErrors.join('\n')}\n` +
                        `Page errors: ${diag.pageErrors.join('\n')}`,
                };
            }

            const runtimeErrors = buildRuntimeErrorContext({
                overlayText: diag.overlayText,
                isBlank: diag.isBlank,
                rootSummary: diag.rootSummary,
                consoleErrors: diag.consoleErrors,
                pageErrors: diag.pageErrors,
                serverOutputTail: diag.serverOutputTail,
            });

            logger.printLog(`🤖 Invoking LaunchAgent to fix runtime errors`);
            logger.printLog(`   Primary file: ${diag.candidateFiles[0] ? path.relative(repoPath, diag.candidateFiles[0]) : 'None'}`);
            logger.printLog(`   Candidate files: ${diag.candidateFiles.length}`);

            const agentResult = (await agent.run(
                formatLaunchAgentInstruction({
                    repoPath,
                    stage: 'runtime',
                    primaryFile: diag.candidateFiles[0] ?? null,
                    candidateFiles: diag.candidateFiles,
                    errorContext: runtimeErrors || diag.error || 'Runtime diagnostics indicated an error.',
                })
            )) as { success: boolean; summary: string[]; editsApplied?: number };

            if (!agentResult.success) {
                const editsApplied = agentResult.editsApplied ?? 0;
                if (editsApplied > 0) {
                    logger.printWarnLog(`   ⚠️  Agent reported partial failure (${editsApplied} edit(s) applied)`);
                    logger.printLog(`   Attempting server restart...`);
                } else {
                    await launchTool.stopDevServer(serverKey).catch(() => {});
                    logger.printErrorLog(`   ❌ Agent could not apply any edits, stopping server`);
                    return {
                        success: false,
                        repoPath,
                        serverUrl,
                        port: serverPort,
                        pid: serverPid,
                        buildAgentIterations,
                        runtimeAgentIterations,
                        error:
                            `LaunchAgent update failed; stopping.\n` +
                            `Agent summary: ${JSON.stringify(agentResult.summary ?? [])}\n` +
                            `Runtime context:\n${runtimeErrors}`,
                    };
                }
            } else {
                const editsApplied = agentResult.editsApplied ?? 0;
                logger.printSuccessLog(`   ✅ Agent applied ${editsApplied} edit(s)`);
            }

            logger.printLog(`   Restarting dev server...`);
            const restartRes = await launchTool.restartDevServer(serverKey, serverStartTimeoutMs);
            if (!restartRes.success || !restartRes.url || !restartRes.port) {
                await launchTool.stopDevServer(serverKey).catch(() => {});
                logger.printErrorLog(`   ❌ Server restart failed`);
                return {
                    success: false,
                    repoPath,
                    serverUrl,
                    port: serverPort,
                    pid: serverPid,
                    buildAgentIterations,
                    runtimeAgentIterations,
                    error: restartRes.error ?? 'Failed to restart dev server after LaunchAgent update.',
                };
            }

            serverUrl = restartRes.url;
            serverPort = restartRes.port;
            serverPid = restartRes.pid;
            logger.printSuccessLog(`   ✅ Server restarted: ${serverUrl}`);
        }

        await launchTool.stopDevServer(serverKey).catch(() => {});
        logger.printErrorLog('');
        logger.printErrorLog('❌ Runtime validation exhausted all retry attempts');
        logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.printErrorLog('📊 Final Summary:');
        logger.printErrorLog(`   • Max runtime attempts reached: ${maxRuntimeAttempts}`);
        logger.printErrorLog(`   • Agent iterations: ${maxRuntimeAttempts}`);
        return {
            success: false,
            repoPath,
            serverUrl,
            port: serverPort,
            pid: serverPid,
            buildAgentIterations,
            runtimeAgentIterations: maxRuntimeAttempts,
            error: `Runtime validation failed after ${maxRuntimeAttempts} LaunchAgent attempt(s).`,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.printErrorLog('');
        logger.printErrorLog('❌ Unexpected error during launch process');
        logger.printErrorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.printErrorLog(message);
        return {
            success: false,
            repoPath,
            buildAgentIterations: 0,
            runtimeAgentIterations: 0,
            error: message,
        };
    }
}
