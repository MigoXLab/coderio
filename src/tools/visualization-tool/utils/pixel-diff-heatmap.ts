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

async function generateRedGreenOverlay(
    data1: Buffer,
    data2: Buffer,
    diffBuffer: Buffer,
    width: number,
    height: number
): Promise<Buffer> {
    const outputData = Buffer.alloc(width * height * 3);

    const gray1 = new Uint8Array(width * height);
    const gray2 = new Uint8Array(width * height);

    for (let i = 0; i < width * height; i++) {
        const r1 = data1[i * 4] ?? 0;
        const g1 = data1[i * 4 + 1] ?? 0;
        const b1 = data1[i * 4 + 2] ?? 0;
        gray1[i] = Math.round(0.299 * r1 + 0.587 * g1 + 0.114 * b1);

        const r2 = data2[i * 4] ?? 0;
        const g2 = data2[i * 4 + 1] ?? 0;
        const b2 = data2[i * 4 + 2] ?? 0;
        gray2[i] = Math.round(0.299 * r2 + 0.587 * g2 + 0.114 * b2);
    }

    let pixelsWithDifferences = 0;
    const minBrightness = 60;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const outIdx = idx * 3;
            const pixel1 = gray1[idx] ?? 0;
            const pixel2 = gray2[idx] ?? 0;

            const isDifferent = (diffBuffer[idx * 4] ?? 0) > 0;
            if (isDifferent) {
                pixelsWithDifferences++;
                if (pixel1 > pixel2) {
                    const redValue = Math.max(minBrightness, pixel1);
                    outputData[outIdx] = Math.min(redValue, 255);
                    outputData[outIdx + 1] = 0;
                    outputData[outIdx + 2] = 0;
                } else {
                    const greenValue = Math.max(minBrightness, pixel2);
                    outputData[outIdx] = 0;
                    outputData[outIdx + 1] = Math.min(greenValue, 255);
                    outputData[outIdx + 2] = 0;
                }
            } else {
                const avg = Math.round((pixel1 + pixel2) / 2);
                outputData[outIdx] = avg;
                outputData[outIdx + 1] = avg;
                outputData[outIdx + 2] = avg;
            }
        }
    }

    logger.printTestLog(
        `[Heatmap] Pixels with differences: ${pixelsWithDifferences} / ${width * height} (${((pixelsWithDifferences / (width * height)) * 100).toFixed(2)}%)`
    );

    return sharp(outputData, { raw: { width, height, channels: 3 } }).png().toBuffer();
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

