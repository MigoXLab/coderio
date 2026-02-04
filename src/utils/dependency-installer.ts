import { execSync } from 'child_process';
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
    const installCmd = `${pm} ${installArgs} ${pkgName}`;

    logger.printInfoLog(`Installing ${pkgName} using ${pm}...`);
    logger.printInfoLog(`Command: ${installCmd}`);

    try {
        execSync(installCmd, { stdio: 'inherit', cwd: process.cwd() });
        logger.printSuccessLog(`Successfully installed ${pkgName}.`);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to install ${pkgName}: ${errorMsg}. Please install it manually.`);
    }
}

export async function ensureValidationDependencies(): Promise<void> {
    // Check sharp
    ensurePackageInstalled('sharp');

    // Check playwright
    ensurePackageInstalled('playwright');

    // Check playwright browsers (chromium)
    // We can try to require playwright and check if executable exists, or just run install deps
    // The safest way for playwright is to run 'npx playwright install chromium' if we just installed it
    // or if launch fails. But checking beforehand is better.
    try {
        const { chromium } = await import('playwright');
        if (!chromium.executablePath()) {
            throw new Error('Chromium not found');
        }
    } catch {
        logger.printInfoLog('Playwright browsers may be missing. Installing chromium...');
        try {
            execSync('npx playwright install chromium', { stdio: 'inherit' });
        } catch {
            logger.printWarnLog(
                'Failed to install playwright browsers automatically. You might need to run "npx playwright install" manually.'
            );
        }
    }
}
