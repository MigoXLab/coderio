import fs from 'node:fs';
import path from 'node:path';

import { logger } from '../../../../utils/logger';

type PackageManager = 'pnpm' | 'yarn' | 'npm';

type PackageJson = {
    scripts?: Record<string, string>;
};

export interface DetectedCommands {
    runCommand: string;
    buildCommand: string;
}

function detectPackageManager(repoPath: string): PackageManager {
    if (fs.existsSync(path.join(repoPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(repoPath, 'yarn.lock'))) return 'yarn';
    return 'npm';
}

function readPackageJson(repoPath: string): PackageJson | null {
    const packageJsonPath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return null;

    try {
        const raw = fs.readFileSync(packageJsonPath, 'utf8');
        return JSON.parse(raw) as PackageJson;
    } catch (error) {
        logger.printWarnLog(
            `Failed to read ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`
        );
        return null;
    }
}

function formatRunCommand(pm: PackageManager, script: string): string {
    if (pm === 'pnpm') return `pnpm ${script}`;
    if (pm === 'yarn') return `yarn ${script}`;
    return `npm run ${script}`;
}

/**
 * Detect reasonable run/build commands for the generated app.
 *
 * - Prefer pnpm when `pnpm-lock.yaml` exists.
 * - Prefer `dev` over `start` for the run command when available.
 */
export async function detectCommands(params?: { repoPath?: string }): Promise<DetectedCommands> {
    const repoPath = params?.repoPath;
    if (!repoPath) {
        logger.printWarnLog('repoPath not provided to detectCommands(); defaulting to "npm run dev" / "npm run build"');
        return { runCommand: 'npm run dev', buildCommand: 'npm run build' };
    }

    const pm = detectPackageManager(repoPath);
    const pkg = readPackageJson(repoPath);
    const scripts = pkg?.scripts ?? {};

    const runScript = scripts.dev ? 'dev' : scripts.start ? 'start' : 'dev';
    const buildScript = scripts.build ? 'build' : 'build';

    return {
        runCommand: formatRunCommand(pm, runScript),
        buildCommand: formatRunCommand(pm, buildScript),
    };
}

