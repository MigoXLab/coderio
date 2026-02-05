import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const require = createRequire(import.meta.url);

export function detectPackageManager(cwd: string = process.cwd()): 'npm' | 'yarn' | 'pnpm' {
    if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
    return 'npm';
}

export function isPackageInstalled(packageName: string): boolean {
    try {
        require.resolve(packageName);
        return true;
    } catch {
        return false;
    }
}

function formatValidationDependencyHelp(missing: string[]): string {
    const isWin = process.platform === 'win32';
    const globalInstall = [
        'npm install -g playwright sharp',
        isWin ? 'npx playwright install chromium' : 'npx playwright install chromium',
    ].join('\n');

    const localInstall = [
        'npm install -D playwright sharp',
        isWin ? 'npx playwright install chromium' : 'npx playwright install chromium',
    ].join('\n');

    const pnpmGlobal = ['pnpm add -g playwright sharp', 'pnpm exec playwright install chromium'].join('\n');
    const pnpmLocal = ['pnpm add -D playwright sharp', 'pnpm exec playwright install chromium'].join('\n');

    return [
        `Missing optional validation dependencies: ${missing.join(', ')}`,
        '',
        'Validation requires Playwright (browsers) and Sharp (image processing).',
        'These dependencies are NOT bundled with coderio by default to keep installation lightweight.',
        '',
        'Recommended (global install):',
        globalInstall,
        '',
        'Or install in your current project:',
        localInstall,
        '',
        'If you use pnpm:',
        '',
        'Global:',
        pnpmGlobal,
        '',
        'Local (project):',
        pnpmLocal,
    ].join('\n');
}

export function assertValidationDependenciesInstalled(): void {
    const missing: string[] = [];
    if (!isPackageInstalled('sharp')) missing.push('sharp');
    if (!isPackageInstalled('playwright')) missing.push('playwright');

    if (missing.length === 0) {
        return;
    }

    throw new Error(formatValidationDependencyHelp(missing));
}

export function ensurePackageInstalled(packageName: string, packageNameInRegistry?: string) {
    const pkgName = packageNameInRegistry || packageName;

    if (isPackageInstalled(packageName)) {
        return;
    }

    logger.printInfoLog(`Package '${packageName}' is required for validation but not installed.`);
    const pm = detectPackageManager();

    // For dependencies that should be devDependencies in the user's project if they are using coderio as a tool
    // But since this runs at runtime, we just install them.
    const installArgs = pm === 'npm' ? 'install' : 'add';
    const pmCmd = process.platform === 'win32' ? `${pm}.cmd` : pm;
    const installCmdDisplay = `${pmCmd} ${installArgs} ${pkgName}`;

    logger.printInfoLog(`Installing ${pkgName} using ${pm}...`);
    logger.printInfoLog(`Command: ${installCmdDisplay}`);

    try {
        const result = spawnSync(pmCmd, [installArgs, pkgName], {
            stdio: 'inherit',
            cwd: process.cwd(),
            shell: process.platform === 'win32',
        });
        if (result.error) {
            throw result.error;
        }
        if (result.status !== 0) {
            throw new Error(`Command exited with code ${result.status}`);
        }
        logger.printSuccessLog(`Successfully installed ${pkgName}.`);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to install ${pkgName}: ${errorMsg}. Please install it manually.`);
    }
}

export function ensureValidationDependencies(): void {
    // Default behavior: only assert presence (do not modify user environment).
    // Auto-installing heavy native deps at runtime can fail and harms UX.
    // If you still want auto-install, call ensurePackageInstalled(...) explicitly from your own wrapper.
    assertValidationDependenciesInstalled();

    // NOTE: We intentionally do not preinstall Playwright browsers here.
    // The Playwright launcher has an auto-install fallback for missing Chromium binaries.
}
