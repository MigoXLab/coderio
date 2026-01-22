/// <reference lib="dom" />

import { Browser, Page } from 'playwright';

import { DEFAULT_TIMEOUT, DEFAULT_VIEWPORT, POSITION_THRESHOLD, SELECTOR_WAIT_TIMEOUT } from '../../../nodes/validation/constants';
import { launchChromiumWithAutoInstall } from '../../../nodes/validation/utils/playwright/launcher';
import { logger } from '../../../utils/logger';

import type { BrowserPositionInput, ElementAbsolutePosition, PositionMetrics, PositionValidationOutput } from '../types';
import { calculatePositionMetrics } from './position-metrics';

/**
 * Captures viewport-relative positions of elements using Playwright + getBoundingClientRect().
 */
export async function captureBrowserPositions(input: BrowserPositionInput): Promise<PositionValidationOutput> {
    const url = input.url;
    const timeout = input.timeout ?? DEFAULT_TIMEOUT;
    const positionThreshold = input.positionThreshold ?? POSITION_THRESHOLD;

    const errors: string[] = [];
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Use pre-computed Figma positions from validation context (offset already applied)
        const figmaPositions = input.validationContext.figmaPositions;
        const designOffset = input.validationContext.offset;

        // Use pre-built element registry (eliminates tree traversals)
        const allElements = Array.from(input.elementRegistry.elements.values()).map(e => ({
            id: e.id,
            name: e.name,
            parentItemId: e.parentComponentId,
            parentItemName: e.parentComponentName,
            parentItemType: e.parentItemType,
        }));

        let viewport = input.viewport ?? DEFAULT_VIEWPORT;
        if (input.figmaThumbnailUrl && !input.viewport) {
            const { fetchThumbnailDimensions } = await import('./fetch-thumbnail-dimensions');
            const thumbnailDimensions = await fetchThumbnailDimensions(input.figmaThumbnailUrl);
            if (thumbnailDimensions) {
                viewport = { width: thumbnailDimensions.width, height: thumbnailDimensions.height };
                logger.printLog(`🎯 Using viewport dimensions from Figma thumbnail: ${viewport.width}×${viewport.height}px`);
            } else {
                logger.printLog(`⚠️  Using default viewport dimensions: ${viewport.width}×${viewport.height}px`);
            }
        }

        try {
            browser = await launchChromiumWithAutoInstall({ headless: true });
        } catch (launchError) {
            throw new Error(`Failed to launch Playwright Chromium browser for position validation: ${(launchError as Error).message}`);
        }

        const context = await browser.newContext({ viewport });
        page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        } catch (error) {
            throw new Error(`Failed to load ${url}. Make sure the development server is running. Error: ${(error as Error).message}`);
        }

        if (input.waitForSelector) {
            try {
                await page.waitForSelector(input.waitForSelector, { timeout: SELECTOR_WAIT_TIMEOUT });
            } catch {
                errors.push(`Warning: waitForSelector "${input.waitForSelector}" timed out`);
            }
        }

        let screenshot: string | undefined;
        if (input.returnScreenshot) {
            try {
                const buffer = await page.screenshot({ fullPage: true, type: 'png' });
                screenshot = `data:image/png;base64,${buffer.toString('base64')}`;
            } catch (error) {
                errors.push(`Warning: Failed to capture screenshot: ${(error as Error).message}`);
            }
        }

        const positions: Record<string, ElementAbsolutePosition> = {};
        let capturedCount = 0;

        for (const element of allElements) {
            try {
                const escapedId = element.id.replace(/:/g, '\\:');
                const selector = `[id="${escapedId}"]`;

                const result = await page.evaluate((sel: string) => {
                    const el = document.querySelector(sel);
                    if (!el) return null;

                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);

                    if (rect.width === 0 && rect.height === 0) {
                        return null;
                    }

                    return {
                        boundingBox: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height,
                            top: rect.top,
                            left: rect.left,
                            right: rect.right,
                            bottom: rect.bottom,
                        },
                        computedStyle: {
                            position: style.position,
                            display: style.display,
                            top: style.top,
                            left: style.left,
                            right: style.right,
                            bottom: style.bottom,
                            transform: style.transform,
                            tagName: el.tagName.toLowerCase(),
                        },
                    };
                }, selector);

                if (!result) {
                    errors.push(`Element ${element.id} not found in DOM or has no dimensions`);
                    continue;
                }

                const figmaPos = figmaPositions[element.id];

                let metrics: PositionMetrics | undefined;
                if (figmaPos) {
                    const xDelta = result.boundingBox.x - figmaPos.x;
                    const yDelta = result.boundingBox.y - figmaPos.y;
                    const xOffset = Math.abs(xDelta);
                    const yOffset = Math.abs(yDelta);
                    const absoluteDistance = Math.sqrt(xOffset ** 2 + yOffset ** 2);

                    metrics = {
                        xOffset: Math.round(xOffset * 100) / 100,
                        yOffset: Math.round(yOffset * 100) / 100,
                        xDelta: Math.round(xDelta * 100) / 100,
                        yDelta: Math.round(yDelta * 100) / 100,
                        absoluteDistance: Math.round(absoluteDistance * 100) / 100,
                        status: absoluteDistance <= positionThreshold ? 'accurate' : 'misaligned',
                    };
                }

                positions[element.id] = {
                    elementId: element.id,
                    elementName: element.name,
                    parentItemId: element.parentItemId,
                    parentItemName: element.parentItemName,
                    parentItemType: element.parentItemType,
                    boundingBox: {
                        x: Math.round(result.boundingBox.x * 100) / 100,
                        y: Math.round(result.boundingBox.y * 100) / 100,
                        width: Math.round(result.boundingBox.width * 100) / 100,
                        height: Math.round(result.boundingBox.height * 100) / 100,
                        top: Math.round(result.boundingBox.top * 100) / 100,
                        left: Math.round(result.boundingBox.left * 100) / 100,
                        right: Math.round(result.boundingBox.right * 100) / 100,
                        bottom: Math.round(result.boundingBox.bottom * 100) / 100,
                    },
                    computedStyle: result.computedStyle,
                    figmaPosition: figmaPos ? { x: figmaPos.x, y: figmaPos.y, width: figmaPos.w, height: figmaPos.h } : undefined,
                    metrics,
                };

                capturedCount++;
            } catch (error) {
                const errorMsg =
                    `Failed to capture position for ${element.id}` +
                    (element.name ? ` (${element.name})` : '') +
                    ` in ${element.parentItemName || 'unknown component'}` +
                    `: ${(error as Error).message}`;
                errors.push(errorMsg);
            }
        }

        const maeMetrics = calculatePositionMetrics(positions);

        return {
            metadata: {
                capturedAt: new Date().toISOString(),
                totalItems: allElements.length,
                capturedItems: capturedCount,
                ...maeMetrics,
                url,
                viewport,
                designOffset,
            },
            positions,
            errors,
            screenshot,
        };
    } finally {
        if (page) {
            await page.close().catch(() => {});
        }
        if (browser) {
            await browser.close().catch(() => {});
        }
    }
}
