/**
 * Utility to fetch Figma thumbnail and extract its dimensions
 * Matches the Python reference implementation from evolt
 */

import axios from 'axios';
import sharp from 'sharp';
import { logger } from '../../../utils/logger';

export interface ThumbnailDimensions {
    width: number;
    height: number;
}

/**
 * Fetches Figma thumbnail and extracts its dimensions.
 * This ensures the browser viewport matches the Figma thumbnail dimensions,
 * preventing screenshot dimension mismatches.
 *
 * Based on evolt Python implementation: _fetch_figma_thumbnail_with_dimensions()
 *
 * @param figmaThumbnailUrl - Figma thumbnail CDN URL
 * @returns Promise resolving to thumbnail dimensions, or undefined if fetch fails
 *
 * @example
 * ```typescript
 * const dimensions = await fetchThumbnailDimensions(figmaThumbnailUrl);
 * if (dimensions) {
 *     const viewport = { width: dimensions.width, height: dimensions.height };
 *     // Use viewport for browser launch
 * }
 * ```
 */
export async function fetchThumbnailDimensions(figmaThumbnailUrl: string): Promise<ThumbnailDimensions | undefined> {
    if (!figmaThumbnailUrl) {
        return undefined;
    }

    try {
        // Fetch the image from Figma CDN
        const response = await axios.get(figmaThumbnailUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
        });

        // Extract dimensions using Sharp
        const imageBuffer = Buffer.from(response.data);
        const metadata = await sharp(imageBuffer).metadata();

        if (!metadata.width || !metadata.height) {
            logger.printTestLog('⚠️  Failed to extract Figma thumbnail dimensions');
            return undefined;
        }

        logger.printTestLog(`✅ Fetched Figma thumbnail dimensions: ${metadata.width}×${metadata.height}px`);

        return {
            width: metadata.width,
            height: metadata.height,
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.printTestLog(`⚠️  Failed to fetch Figma thumbnail: ${errorMsg}`);
        return undefined;
    }
}
