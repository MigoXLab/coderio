import type { Page } from 'playwright';

import { launchChromiumWithAutoInstall } from '../../../nodes/validation/utils/playwright/launcher';
import { extractCandidateFilesFromLog } from './error-parsing';

export interface RuntimeDiagnosticsInput {
    serverUrl: string;
    timeoutMs: number;
    viewport: { width: number; height: number };
    repoPath: string;
}

export interface RuntimeDiagnosticsOutput {
    overlayText: string;
    isBlank: boolean;
    rootSummary: { childCount: number; textLength: number; htmlSnippet: string };
    consoleErrors: string[];
    pageErrors: string[];
    candidateFiles: string[];
}

function collectConsoleErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    page.on('pageerror', err => {
        pageErrors.push(err.message);
    });

    return { consoleErrors, pageErrors };
}

async function extractViteOverlayText(page: Page): Promise<string> {
    return await page.evaluate(() => {
        const overlay = document.querySelector('vite-error-overlay') as unknown as { shadowRoot?: ShadowRoot } | null;
        const shadowText = overlay?.shadowRoot?.textContent?.trim() ?? '';
        if (shadowText) return shadowText;

        const legacy = document.querySelector('#vite-error-overlay') as HTMLElement;
        const legacyText = legacy?.textContent?.trim() ?? '';
        return legacyText;
    });
}

async function getRootSummary(page: Page): Promise<{ childCount: number; textLength: number; htmlSnippet: string; isBlank: boolean }> {
    return await page.evaluate(() => {
        const root = document.querySelector('#root') as HTMLElement;
        if (!root) {
            return { childCount: 0, textLength: 0, htmlSnippet: '', isBlank: true };
        }

        const text = (root.textContent ?? '').trim();
        const childCount = root.children?.length ?? 0;
        const htmlSnippet = (root.innerHTML ?? '').slice(0, 400);

        // "Blank" heuristic: no children and no text.
        const isBlank = childCount === 0 && text.length === 0;

        return { childCount, textLength: text.length, htmlSnippet, isBlank };
    });
}

export async function runtimeDiagnostics(input: RuntimeDiagnosticsInput): Promise<RuntimeDiagnosticsOutput> {
    const browser = await launchChromiumWithAutoInstall({ headless: true });
    try {
        const context = await browser.newContext({ viewport: input.viewport });
        const page = await context.newPage();

        const { consoleErrors, pageErrors } = collectConsoleErrors(page);
        await page.goto(input.serverUrl, { waitUntil: 'domcontentloaded', timeout: input.timeoutMs });
        await page.waitForTimeout(1500);

        const overlayText = (await extractViteOverlayText(page)).trim();
        const root = await getRootSummary(page);

        const combined = [overlayText, ...pageErrors, ...consoleErrors].filter(Boolean).join('\n');
        const candidateFiles = extractCandidateFilesFromLog(input.repoPath, combined);

        return {
            overlayText,
            isBlank: root.isBlank,
            rootSummary: { childCount: root.childCount, textLength: root.textLength, htmlSnippet: root.htmlSnippet },
            consoleErrors,
            pageErrors,
            candidateFiles,
        };
    } finally {
        await browser.close().catch(() => {});
    }
}
