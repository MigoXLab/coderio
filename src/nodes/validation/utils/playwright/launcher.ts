import type { Browser, LaunchOptions } from 'playwright';
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { dirname, join } from 'path';

import { logger } from '../../../../utils/logger';

const MISSING_EXECUTABLE_MESSAGE = "Executable doesn't exist";

/**
 * Get the path to the locally installed playwright CLI.
 * Uses Node.js module resolution to ensure the version matches the imported playwright.
 *
 * Note: We can't use require.resolve('playwright/cli') directly because
 * the 'exports' field in playwright's package.json doesn't expose './cli'.
 * Instead, we resolve the main entry and derive the cli.js path from it.
 */
function getLocalPlaywrightCliPath(): string {
    const require = createRequire(import.meta.url);
    const playwrightMain = require.resolve('playwright');
    return join(dirname(playwrightMain), 'cli.js');
}

let installPromise: Promise<void> | null = null;
let installCompleted = false;

async function installChromiumBrowsers(): Promise<void> {
    if (installCompleted) return;

    if (!installPromise) {
        logger.printInfoLog('Playwright Chromium binaries are missing. Installing them automatically...');

        installPromise = new Promise((resolve, reject) => {
            // NOTE: Avoid --with-deps here; it can try to install system packages on some platforms.
            const cliPath = getLocalPlaywrightCliPath();
            const child = spawn(process.execPath, [cliPath, 'install', 'chromium'], {
                stdio: 'inherit',
                env: process.env,
            });

            child.on('error', error => {
                installPromise = null;
                reject(error);
            });

            child.on('close', code => {
                installPromise = null;
                if (code === 0) {
                    installCompleted = true;
                    logger.printSuccessLog('Playwright Chromium installation finished.');
                    resolve();
                } else {
                    reject(new Error(`Playwright install exited with code ${code}`));
                }
            });
        });
    }

    return installPromise;
}

function isMissingExecutableError(error: unknown): boolean {
    return error instanceof Error && error.message.includes(MISSING_EXECUTABLE_MESSAGE);
}

export async function launchChromiumWithAutoInstall(options: LaunchOptions = {}): Promise<Browser> {
    const launchOptions: LaunchOptions = { headless: true, ...options };

    try {
        return await chromium.launch(launchOptions);
    } catch (error) {
        if (isMissingExecutableError(error)) {
            try {
                await installChromiumBrowsers();
            } catch (installError) {
                throw new Error(
                    'Failed to auto-install Playwright browsers required for validation.\n' +
                        'Please run "npx playwright install chromium" or "pnpm exec playwright install chromium" manually and retry.\n' +
                        `Installer error: ${(installError as Error).message}`
                );
            }

            return chromium.launch(launchOptions);
        }

        throw error;
    }
}
