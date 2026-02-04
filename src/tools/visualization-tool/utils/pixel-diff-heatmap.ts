import sharp from 'sharp';
import pixelmatch from 'pixelmatch';

import { logger } from '../../../utils/logger';
import { bufferToWebPDataUri } from './image-converter';

/**
 * Generates a pixel-difference heatmap comparing rendered and target images.
 * Uses pixelmatch algorithm for perceptually-accurate pixel comparison.
 */
export async function generatePixelDiffHeatmap(renderSnap: string, targetSnap: string): Promise<string> {
    const img1Data = await loadImageData(renderSnap);
    const img2Data = await loadImageData(targetSnap);

    let { width: width1, height: height1, data: data1 } = img1Data;
    let { width: width2, height: height2, data: data2 } = img2Data;

    if (width1 !== width2 || height1 !== height2) {
        const resized = await sharp(data2, {
            raw: { width: width2, height: height2, channels: 4 },
        })
            .resize(width1, height1, { fit: 'fill' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        data2 = resized.data;
        width2 = resized.info.width;
        height2 = resized.info.height;
    }

    const MAX_DIMENSION = 2500;
    if (height1 > MAX_DIMENSION || width1 > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(height1, width1);
        const newWidth = Math.floor(width1 * scale);
        const newHeight = Math.floor(height1 * scale);

        const downsampled1 = await sharp(data1, {
            raw: { width: width1, height: height1, channels: 4 },
        })
            .resize(newWidth, newHeight, { kernel: 'lanczos3' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const downsampled2 = await sharp(data2, {
            raw: { width: width2, height: height2, channels: 4 },
        })
            .resize(newWidth, newHeight, { kernel: 'lanczos3' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        data1 = downsampled1.data;
        data2 = downsampled2.data;
        width1 = downsampled1.info.width;
        height1 = downsampled1.info.height;
        width2 = downsampled2.info.width;
        height2 = downsampled2.info.height;
    }

    const diffBuffer = Buffer.alloc(width1 * height1 * 4);

    const numDiffPixels = pixelmatch(data1, data2, diffBuffer, width1, height1, {
        threshold: 0.1,
        includeAA: false,
        alpha: 0.1,
        diffColor: [255, 0, 0],
        diffMask: false,
    });

    const totalPixels = width1 * height1;
    const diffPercentage = ((numDiffPixels / totalPixels) * 100).toFixed(2);
    logger.printTestLog(`[Pixelmatch] Different pixels: ${numDiffPixels} / ${totalPixels} (${diffPercentage}%)`);

    const heatmapBuffer = await generateRedGreenOverlay(data1, data2, diffBuffer, width1, height1);
    return await bufferToWebPDataUri(heatmapBuffer);
}

async function generateRedGreenOverlay(data1: Buffer, data2: Buffer, diffBuffer: Buffer, width: number, height: number): Promise<Buffer> {
    const outputData = Buffer.alloc(width * height * 3);

    // Calculate color differences for each pixel
    const differences = new Float32Array(width * height);
    let maxDiff = 0;

    for (let i = 0; i < width * height; i++) {
        const r1 = data1[i * 4] ?? 0;
        const g1 = data1[i * 4 + 1] ?? 0;
        const b1 = data1[i * 4 + 2] ?? 0;

        const r2 = data2[i * 4] ?? 0;
        const g2 = data2[i * 4 + 1] ?? 0;
        const b2 = data2[i * 4 + 2] ?? 0;

        // Calculate perceptual color difference
        const diff = Math.sqrt(Math.pow(r1 - r2, 2) * 0.299 + Math.pow(g1 - g2, 2) * 0.587 + Math.pow(b1 - b2, 2) * 0.114);

        differences[i] = diff;
        maxDiff = Math.max(maxDiff, diff);
    }

    let pixelsWithDifferences = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const outIdx = idx * 3;

            const isDifferent = (diffBuffer[idx * 4] ?? 0) > 0;

            if (isDifferent) {
                pixelsWithDifferences++;

                // Normalize difference to 0-1 range
                const normalizedDiff = maxDiff > 0 ? (differences[idx] ?? 0) / maxDiff : 0;

                // Map to blue-yellow-red gradient
                // Blue (0,0,255) -> Cyan (0,255,255) -> Yellow (255,255,0) -> Red (255,0,0)
                const [r, g, b] = getDiffColor(normalizedDiff);
                outputData[outIdx] = r;
                outputData[outIdx + 1] = g;
                outputData[outIdx + 2] = b;
            } else {
                // For matching pixels, show in deep blue to indicate good match
                outputData[outIdx] = 0;
                outputData[outIdx + 1] = 0;
                outputData[outIdx + 2] = 200; // Deep blue
            }
        }
    }

    logger.printTestLog(
        `[Heatmap] Pixels with differences: ${pixelsWithDifferences} / ${width * height} (${((pixelsWithDifferences / (width * height)) * 100).toFixed(2)}%)`
    );

    return sharp(outputData, { raw: { width, height, channels: 3 } })
        .png()
        .toBuffer();
}

/**
 * Maps normalized difference (0-1) to color gradient:
 * 0.0 = Deep Blue (perfect match)
 * 0.3 = Cyan (slight difference)
 * 0.6 = Yellow (moderate difference)
 * 1.0 = Red (maximum difference)
 */
function getDiffColor(normalizedDiff: number): [number, number, number] {
    // Clamp to 0-1 range
    normalizedDiff = Math.max(0, Math.min(1, normalizedDiff));

    if (normalizedDiff < 0.33) {
        // Blue to Cyan transition
        const t = normalizedDiff / 0.33;
        return [0, Math.round(255 * t), 255];
    } else if (normalizedDiff < 0.67) {
        // Cyan to Yellow transition
        const t = (normalizedDiff - 0.33) / 0.34;
        return [Math.round(255 * t), 255, Math.round(255 * (1 - t))];
    } else {
        // Yellow to Red transition
        const t = (normalizedDiff - 0.67) / 0.33;
        return [255, Math.round(255 * (1 - t)), 0];
    }
}

async function loadImageData(dataUri: string): Promise<{ width: number; height: number; data: Buffer }> {
    if (!dataUri.startsWith('data:')) {
        const axios = (await import('axios')).default;
        const response = await axios.get(dataUri, { responseType: 'arraybuffer', timeout: 30000 });
        const base64 = Buffer.from(response.data).toString('base64');
        dataUri = `data:image/png;base64,${base64}`;
    }

    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
        throw new Error('Invalid data URI format: missing base64 data');
    }
    const buffer = Buffer.from(base64Data, 'base64');

    const image = sharp(buffer);
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    return { width: info.width, height: info.height, data };
}
