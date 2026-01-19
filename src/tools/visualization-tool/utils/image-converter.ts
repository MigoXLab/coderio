/**
 * Image conversion utilities for screenshot processing.
 * Handles PNG -> WebP conversion and base64 encoding.
 */

import sharp from 'sharp';
import type { Page } from 'playwright';

/**
 * WebP quality for screenshot compression (1-100).
 * Higher = better quality but larger file size.
 */
export const SCREENSHOT_WEBP_QUALITY = 88;

/**
 * Captures a Playwright page screenshot and converts it to WebP base64 data URI.
 */
export async function captureAsWebP(page: Page, options: { fullPage?: boolean } = {}): Promise<string> {
    const pngBuffer = await page.screenshot({
        type: 'png',
        fullPage: options.fullPage ?? false,
    });

    return await bufferToWebPDataUri(pngBuffer);
}

/**
 * Converts a raw image buffer to WebP base64 data URI.
 */
export async function bufferToWebPDataUri(buffer: Buffer): Promise<string> {
    const webpBuffer = await sharp(buffer).webp({ quality: SCREENSHOT_WEBP_QUALITY }).toBuffer();
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
}

