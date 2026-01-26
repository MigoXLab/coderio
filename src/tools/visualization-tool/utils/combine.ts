import fs from 'fs';
import path from 'path';

import sharp from 'sharp';

import type { CombineOptions } from '../types';
import { SCREENSHOT_WEBP_QUALITY } from './image-converter';

const DEFAULT_OPTIONS: Required<CombineOptions> = {
    leftHeader: 'RENDER (Current)',
    rightHeader: 'TARGET (Expected)',
    gapWidth: 40,
    headerHeight: 60,
};

/**
 * Combines two annotated screenshots side-by-side with headers.
 * Matches the Python reference implementation from evolt.
 */
export async function combineSideBySide(
    renderBase64: string,
    targetBase64: string,
    outputPath: string,
    options?: CombineOptions
): Promise<void> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
        const leftBase64 = extractBase64Data(renderBase64);
        const rightBase64 = extractBase64Data(targetBase64);

        const leftBuffer = Buffer.from(leftBase64, 'base64');
        const rightBuffer = Buffer.from(rightBase64, 'base64');

        const leftMeta = await sharp(leftBuffer).metadata();
        const rightMeta = await sharp(rightBuffer).metadata();

        if (!leftMeta.width || !leftMeta.height || !rightMeta.width || !rightMeta.height) {
            throw new Error('Failed to read image dimensions');
        }

        const scale = leftMeta.height / rightMeta.height;
        const rightResizedWidth = Math.round(rightMeta.width * scale);

        const rightResized = await sharp(rightBuffer).resize({ height: leftMeta.height, width: rightResizedWidth, fit: 'fill' }).toBuffer();

        const combinedWidth = leftMeta.width + opts.gapWidth + rightResizedWidth;
        const combinedHeight = opts.headerHeight + leftMeta.height;

        const centerX = leftMeta.width + opts.gapWidth / 2;
        const leftTextX = leftMeta.width / 2;
        const rightTextX = leftMeta.width + opts.gapWidth + rightResizedWidth / 2;
        const textY = opts.headerHeight / 2 + 8;

        const headerSvg = `
<svg width="${combinedWidth}" height="${opts.headerHeight}">
  <rect width="${combinedWidth}" height="${opts.headerHeight}" fill="#F0F0F0"/>
  <line x1="${centerX}" y1="0" x2="${centerX}" y2="${combinedHeight}"
        stroke="#C8C8C8" stroke-width="2"/>
  <text x="${leftTextX}" y="${textY}"
        font-family="Arial" font-size="24" font-weight="bold" fill="#C80000"
        text-anchor="middle">
    ${opts.leftHeader}
  </text>
  <text x="${rightTextX}" y="${textY}"
        font-family="Arial" font-size="24" font-weight="bold" fill="#009600"
        text-anchor="middle">
    ${opts.rightHeader}
  </text>
</svg>
        `;

        const headerBuffer = Buffer.from(headerSvg);

        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        await sharp({
            create: {
                width: combinedWidth,
                height: combinedHeight,
                channels: 3,
                background: { r: 255, g: 255, b: 255 },
            },
        })
            .composite([
                { input: headerBuffer, top: 0, left: 0 },
                { input: leftBuffer, top: opts.headerHeight, left: 0 },
                { input: rightResized, top: opts.headerHeight, left: leftMeta.width + opts.gapWidth },
            ])
            .webp({ quality: SCREENSHOT_WEBP_QUALITY })
            .toFile(outputPath);
    } catch (error) {
        throw new Error(`Failed to combine side-by-side screenshots: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function extractBase64Data(base64String: string): string {
    const dataUriMatch = base64String.match(/^data:image\/[a-z]+;base64,(.+)$/);
    if (dataUriMatch && dataUriMatch[1]) {
        return dataUriMatch[1];
    }
    return base64String;
}
