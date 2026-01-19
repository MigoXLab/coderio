import * as fs from 'fs';
import * as path from 'path';
import { tools } from 'evoltagent';

import { logger } from '../../utils/logger';
import type {
    BuildProjectResult,
    DetectedCommands,
    InstallDependenciesResult,
    RuntimeDiagnosticsResult,
    StartDevServerResult,
    StopDevServerResult,
} from './types';
import { runCommandCapture } from './utils/command-runner';
import { DevServerManager } from './utils/dev-server-manager';
import { extractCandidateFilesFromLog } from './utils/error-parsing';

function detectInstallCommand(repoPath: string): string {
    const pnpmLock = path.join(repoPath, 'pnpm-lock.yaml');
    const yarnLock = path.join(repoPath, 'yarn.lock');
    const npmLock = path.join(repoPath, 'package-lock.json');

    if (fs.existsSync(pnpmLock)) return 'pnpm i';
    if (fs.existsSync(yarnLock)) return 'yarn install';
    if (fs.existsSync(npmLock)) return 'npm install';
    return 'npm install';
}

type PackageManager = 'pnpm' | 'yarn' | 'npm';

function detectPackageManager(repoPath: string): PackageManager {
    const pnpmLock = path.join(repoPath, 'pnpm-lock.yaml');
    const yarnLock = path.join(repoPath, 'yarn.lock');
    const npmLock = path.join(repoPath, 'package-lock.json');

    if (fs.existsSync(pnpmLock)) return 'pnpm';
    if (fs.existsSync(yarnLock)) return 'yarn';
    if (fs.existsSync(npmLock)) return 'npm';
    return 'npm';
}

type PackageJson = {
    scripts?: Record<string, string>;
};

function readPackageJson(repoPath: string): PackageJson | null {
    const packageJsonPath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return null;

    try {
        const raw = fs.readFileSync(packageJsonPath, 'utf8');
        return JSON.parse(raw) as PackageJson;
    } catch (error) {
        logger.printWarnLog(`Failed to read ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}

function formatRunCommand(pm: PackageManager, script: string): string {
    if (pm === 'pnpm') return `pnpm ${script}`;
    if (pm === 'yarn') return `yarn ${script}`;
    return `npm run ${script}`;
}

function buildInstallDevDependencyCommand(repoPath: string, depName: string): string {
    const pm = detectPackageManager(repoPath);
    if (pm === 'pnpm') return `pnpm add -D ${depName}`;
    if (pm === 'yarn') return `yarn add -D ${depName}`;
    return `npm install -D ${depName}`;
}

function pickPrimarySourceFile(repoPath: string, log: string): string | null {
    const candidates = extractCandidateFilesFromLog(repoPath, log);
    if (candidates.length === 0) return null;

    // Prefer src/ files
    const srcCandidate = candidates.find(p => p.includes(`${path.sep}src${path.sep}`));
    return srcCandidate ?? candidates[0] ?? null;
}

/**
 * Generate a stable lookup key for a dev server instance.
 * Port and pid are NOT included because:
 * - They become stale after restart (port may change, pid always changes)
 * - DevServerManager tracks current port/pid in its internal state
 * - serverKey is only used for Map lookup, never parsed
 */
function makeServerKey(repoPath: string): string {
    const safeRepo = repoPath.split(path.sep).join('_');
    return `launch:${safeRepo}:${Date.now()}`;
}

@tools({
    detectCommands: {
        description:
            'Detect the package manager and choose reasonable run/build commands (prefer dev over start when available).',
        params: [{ name: 'repoPath', type: 'string', description: 'Absolute path to the repository', optional: true }],
        returns: { type: 'object', description: 'DetectedCommands with runCommand/buildCommand.' },
    },
    installDependencies: {
        description: 'Detect the package manager and install dependencies in repoPath with a timeout.',
        params: [
            { name: 'repoPath', type: 'string', description: 'Absolute path to the repository' },
            { name: 'timeoutMs', type: 'number', description: 'Timeout in milliseconds', optional: true },
        ],
        returns: { type: 'object', description: 'InstallDependenciesResult with success/exitCode/output.' },
    },
    buildProject: {
        description:
            'Build the project in repoPath using buildCommand with a timeout; returns output and candidate source files extracted from logs.',
        params: [
            { name: 'repoPath', type: 'string', description: 'Absolute path to the repository' },
            { name: 'buildCommand', type: 'string', description: 'Build command (e.g. "npm run build")' },
            { name: 'timeoutMs', type: 'number', description: 'Timeout in milliseconds', optional: true },
        ],
        returns: { type: 'object', description: 'BuildProjectResult with candidateFiles and primaryFile.' },
    },
    startDevServer: {
        description: 'Start a dev server in-process and wait for it to become reachable.',
        params: [
            { name: 'repoPath', type: 'string', description: 'Absolute path to the repository' },
            { name: 'runCommand', type: 'string', description: 'Run command (e.g. "npm run dev")' },
            { name: 'timeoutMs', type: 'number', description: 'Timeout in milliseconds', optional: true },
        ],
        returns: { type: 'object', description: 'StartDevServerResult with url/port/pid/serverKey.' },
    },
    stopDevServer: {
        description: 'Stop a previously started dev server by serverKey.',
        params: [{ name: 'serverKey', type: 'string', description: 'Server key returned by startDevServer()' }],
        returns: { type: 'object', description: 'StopDevServerResult' },
    },
    restartDevServer: {
        description: 'Restart a previously started dev server by serverKey.',
        params: [
            { name: 'serverKey', type: 'string', description: 'Server key returned by startDevServer()' },
            { name: 'timeoutMs', type: 'number', description: 'Timeout in milliseconds', optional: true },
        ],
        returns: { type: 'object', description: 'StartDevServerResult (new pid/port may change).' },
    },
    runtimeDiagnostics: {
        description:
            'Deterministically inspect the running app: Vite error overlay text, #root blank detection, console/page errors, and file candidates.',
        params: [
            { name: 'repoPath', type: 'string', description: 'Absolute path to the repository (for file candidate extraction)' },
            { name: 'serverUrl', type: 'string', description: 'Server URL (e.g. http://localhost:5173)' },
            { name: 'timeoutMs', type: 'number', description: 'Navigation timeout in milliseconds', optional: true },
            { name: 'viewport', type: 'object', description: 'Viewport {width,height}', optional: true },
            { name: 'serverKey', type: 'string', description: 'Optional serverKey to include server output tail', optional: true },
        ],
        returns: { type: 'object', description: 'RuntimeDiagnosticsResult' },
    },
})
export class LaunchTool {
    private static readonly serverManagers = new Map<string, { manager: DevServerManager; repoPath: string }>();

    async detectCommands(repoPath?: string): Promise<DetectedCommands> {
        if (!repoPath) {
            logger.printWarnLog('repoPath not provided to detectCommands(); defaulting to "npm run dev" / "npm run build"');
            return { runCommand: 'npm run dev', buildCommand: 'npm run build' };
        }

        const pm = detectPackageManager(repoPath);
        const pkg = readPackageJson(repoPath);
        const scripts = pkg?.scripts ?? {};

        const runScript = scripts.dev ? 'dev' : scripts.start ? 'start' : 'dev';

        return {
            runCommand: formatRunCommand(pm, runScript),
            buildCommand: formatRunCommand(pm, 'build'),
        };
    }

    async installDependencies(repoPath: string, timeoutMs: number = 180_000): Promise<InstallDependenciesResult> {
        const command = detectInstallCommand(repoPath);
        logger.printLog(`📦 Installing dependencies: ${command}`);
        try {
            const res = await runCommandCapture({ cwd: repoPath, command, timeoutMs });
            return {
                success: res.exitCode === 0,
                command,
                exitCode: res.exitCode,
                timedOut: res.timedOut,
                combined: res.combined,
                error: res.exitCode === 0 ? undefined : `Dependency install failed (exitCode=${res.exitCode}, timeout=${res.timedOut}).`,
            };
        } catch (error) {
            return {
                success: false,
                command,
                exitCode: 1,
                timedOut: false,
                combined: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async installDevDependency(
        repoPath: string,
        dependency: string,
        timeoutMs: number = 180_000
    ): Promise<InstallDependenciesResult> {
        const dep = dependency.trim();
        const command = buildInstallDevDependencyCommand(repoPath, dep);
        logger.printLog(`📦 Installing dev dependency: ${command}`);
        try {
            const res = await runCommandCapture({ cwd: repoPath, command, timeoutMs });
            return {
                success: res.exitCode === 0,
                command,
                exitCode: res.exitCode,
                timedOut: res.timedOut,
                combined: res.combined,
                error: res.exitCode === 0 ? undefined : `Dev dependency install failed (exitCode=${res.exitCode}, timeout=${res.timedOut}).`,
            };
        } catch (error) {
            return {
                success: false,
                command,
                exitCode: 1,
                timedOut: false,
                combined: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async buildProject(repoPath: string, buildCommand: string, timeoutMs: number = 180_000): Promise<BuildProjectResult> {
        const command = buildCommand.trim();
        logger.printLog(`🔨 Building: ${command}`);
        try {
            const res = await runCommandCapture({ cwd: repoPath, command, timeoutMs });
            const candidateFiles = extractCandidateFilesFromLog(repoPath, res.combined);
            const primaryFile = pickPrimarySourceFile(repoPath, res.combined);
            return {
                success: res.exitCode === 0,
                command,
                exitCode: res.exitCode,
                timedOut: res.timedOut,
                combined: res.combined,
                candidateFiles,
                primaryFile,
                error: res.exitCode === 0 ? undefined : `Build failed (exitCode=${res.exitCode}, timeout=${res.timedOut}).`,
            };
        } catch (error) {
            return {
                success: false,
                command,
                exitCode: 1,
                timedOut: false,
                combined: '',
                candidateFiles: [],
                primaryFile: null,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async startDevServer(repoPath: string, runCommand: string, timeoutMs: number = 60_000): Promise<StartDevServerResult> {
        try {
            const manager = new DevServerManager({ repoPath, runCommand: runCommand.trim() });
            const handle = await manager.start({ timeoutMs });
            const serverKey = makeServerKey(repoPath);
            LaunchTool.serverManagers.set(serverKey, { manager, repoPath });
            return {
                success: true,
                serverKey,
                url: handle.url,
                port: handle.port,
                pid: handle.child.pid ?? undefined,
                outputTail: handle.outputTail(),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async stopDevServer(serverKey: string): Promise<StopDevServerResult> {
        const entry = LaunchTool.serverManagers.get(serverKey);
        if (!entry) {
            return { success: false, serverKey, error: `Unknown serverKey: ${serverKey}` };
        }
        try {
            await entry.manager.stop();
            LaunchTool.serverManagers.delete(serverKey);
            return { success: true, serverKey };
        } catch (error) {
            return { success: false, serverKey, error: error instanceof Error ? error.message : String(error) };
        }
    }

    async restartDevServer(serverKey: string, timeoutMs: number = 60_000): Promise<StartDevServerResult> {
        const entry = LaunchTool.serverManagers.get(serverKey);
        if (!entry) {
            return { success: false, error: `Unknown serverKey: ${serverKey}` };
        }
        try {
            const handle = await entry.manager.restart({ timeoutMs });
            return {
                success: true,
                serverKey,
                url: handle.url,
                port: handle.port,
                pid: handle.child.pid ?? undefined,
                outputTail: handle.outputTail(),
            };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    async runtimeDiagnostics(
        repoPath: string,
        serverUrl: string,
        timeoutMs: number = 45_000,
        viewport: { width: number; height: number } = { width: 1365, height: 768 },
        serverKey?: string
    ): Promise<RuntimeDiagnosticsResult> {
        try {
            const { runtimeDiagnostics: runRuntimeDiagnostics } = await import('./utils/runtime-diagnostics');
            const diag = await runRuntimeDiagnostics({ repoPath, serverUrl, timeoutMs, viewport });
            const overlayText = diag.overlayText.trim();

            const entry = serverKey ? LaunchTool.serverManagers.get(serverKey) : null;
            const serverOutputTail = entry?.manager.current?.outputTail();

            const ok = overlayText.length === 0 && diag.pageErrors.length === 0 && diag.consoleErrors.length === 0 && !diag.isBlank;
            return {
                ok,
                serverUrl,
                overlayText,
                isBlank: diag.isBlank,
                rootSummary: diag.rootSummary,
                consoleErrors: diag.consoleErrors,
                pageErrors: diag.pageErrors,
                candidateFiles: diag.candidateFiles,
                serverOutputTail,
            };
        } catch (error) {
            return {
                ok: false,
                serverUrl,
                overlayText: '',
                isBlank: true,
                rootSummary: { childCount: 0, textLength: 0, htmlSnippet: '' },
                consoleErrors: [],
                pageErrors: [],
                candidateFiles: [],
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

