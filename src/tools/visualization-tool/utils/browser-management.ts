/**
 * Browser lifecycle management utilities for Playwright operations.
 * Provides higher-order functions to handle browser setup and teardown.
 */

import type { Browser, Page } from 'playwright';
import { launchChromiumWithAutoInstall } from '../../../nodes/validation/utils/playwright/launcher';

/**
 * Executes an operation with a managed browser and page instance.
 * Automatically handles browser launch, context creation, and cleanup.
 */
export async function browserManagement<T>(
    viewport: { width: number; height: number },
    operation: (browser: Browser, page: Page) => Promise<T>
): Promise<T> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        browser = await launchChromiumWithAutoInstall({ headless: true });
        const context = await browser.newContext({ viewport });
        page = await context.newPage();

        return await operation(browser, page);
    } finally {
        if (page) await page.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
    }
}

