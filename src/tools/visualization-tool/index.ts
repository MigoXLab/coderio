import { tools } from 'evoltagent';

import type { AnnotateRenderResult, CombineOptions, MisalignedComponentData } from './types';
import { annotateRenderWithPlaywright } from './utils/annotate-render';
import { annotateTargetWithPlaywright } from './utils/annotate-target';
import { browserManagement } from './utils/browser-management';
import { combineSideBySide } from './utils/combine';
import { captureAsWebP } from './utils/image-converter';
import { generatePixelDiffHeatmap } from './utils/pixel-diff-heatmap';

export { browserManagement } from './utils/browser-management';
export { captureAsWebP, bufferToWebPDataUri, SCREENSHOT_WEBP_QUALITY } from './utils/image-converter';
export { annotateRenderWithPlaywright } from './utils/annotate-render';
export { annotateTargetWithPlaywright } from './utils/annotate-target';
export { combineSideBySide } from './utils/combine';
export { generatePixelDiffHeatmap } from './utils/pixel-diff-heatmap';

@tools({
    annotateRender: {
        description:
            'Navigate to the dev server, capture a clean render screenshot, inject RED annotation boxes for misaligned components, and capture the annotated render screenshot.',
        params: [
            { name: 'serverUrl', type: 'string', description: 'Dev server URL (e.g., http://localhost:5173)' },
            {
                name: 'misalignedData',
                type: 'object',
                description: 'MisalignedComponentData[] used to draw RED boxes on the render.',
            },
            { name: 'viewport', type: 'object', description: 'Viewport {width,height} to use in Playwright.' },
        ],
        returns: {
            type: 'object',
            description: 'AnnotateRenderResult containing renderSnap and renderMarked (WebP data URIs).',
        },
    },
    annotateTarget: {
        description:
            'Fetch the Figma thumbnail, inject GREEN annotation boxes for misaligned components, and return an annotated target screenshot.',
        params: [
            { name: 'figmaThumbnailUrl', type: 'string', description: 'Figma thumbnail CDN URL.' },
            {
                name: 'misalignedData',
                type: 'object',
                description: 'MisalignedComponentData[] used to draw GREEN boxes on the target.',
            },
            { name: 'viewport', type: 'object', description: 'Viewport {width,height} to match the Figma thumbnail.' },
            {
                name: 'designOffset',
                type: 'object',
                description: 'Design offset {x,y} used when the thumbnail is not cropped (default behavior is cropped).',
                optional: true,
            },
        ],
        returns: { type: 'string', description: 'Annotated target screenshot as WebP data URI.' },
    },
    combine: {
        description: 'Combine two base64 screenshots side-by-side with headers and write to outputPath (WebP).',
        params: [
            { name: 'renderMarked', type: 'string', description: 'Left image (render, typically annotated) as base64 data URI.' },
            { name: 'targetMarked', type: 'string', description: 'Right image (target, typically annotated) as base64 data URI.' },
            { name: 'outputPath', type: 'string', description: 'Filesystem output path for the combined WebP.' },
            { name: 'options', type: 'object', description: 'Optional CombineOptions', optional: true },
        ],
        returns: { type: 'string', description: 'The outputPath written.' },
    },
    diffHeatmap: {
        description: 'Generate pixel-diff heatmap between a render screenshot and the target thumbnail.',
        params: [
            { name: 'renderSnap', type: 'string', description: 'Render screenshot (WebP data URI).' },
            { name: 'targetSnap', type: 'string', description: 'Target screenshot (WebP data URI) OR URL.' },
        ],
        returns: { type: 'string', description: 'Heatmap image as WebP data URI.' },
    },
})
export class VisualizationTool {
    async annotateRender(
        serverUrl: string,
        misalignedData: MisalignedComponentData[],
        viewport: { width: number; height: number }
    ): Promise<AnnotateRenderResult> {
        return await browserManagement(viewport, async (_browser, page) => {
            await page.goto(serverUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 1000));

            const renderSnap = await captureAsWebP(page);
            await annotateRenderWithPlaywright(page, misalignedData);
            const renderMarked = await captureAsWebP(page);

            return { renderSnap, renderMarked };
        });
    }

    async annotateTarget(
        figmaThumbnailUrl: string,
        misalignedData: MisalignedComponentData[],
        viewport: { width: number; height: number },
        designOffset?: { x: number; y: number }
    ): Promise<string> {
        const axios = (await import('axios')).default;
        const response = await axios.get(figmaThumbnailUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const figmaThumbnailBase64 = Buffer.from(response.data).toString('base64');

        return await browserManagement(viewport, async (browser) => {
            return await annotateTargetWithPlaywright(browser, figmaThumbnailBase64, misalignedData, viewport, designOffset);
        });
    }

    /**
     * Annotate target using pre-cached base64 thumbnail data.
     * Use this method when you have already downloaded the Figma thumbnail to avoid redundant downloads.
     */
    async annotateTargetFromBase64(
        figmaThumbnailBase64: string,
        misalignedData: MisalignedComponentData[],
        viewport: { width: number; height: number },
        designOffset?: { x: number; y: number }
    ): Promise<string> {
        return await browserManagement(viewport, async (browser) => {
            return await annotateTargetWithPlaywright(browser, figmaThumbnailBase64, misalignedData, viewport, designOffset);
        });
    }

    async combine(
        renderMarked: string,
        targetMarked: string,
        outputPath: string,
        options?: CombineOptions
    ): Promise<string> {
        await combineSideBySide(renderMarked, targetMarked, outputPath, options);
        return outputPath;
    }

    async diffHeatmap(renderSnap: string, targetSnap: string): Promise<string> {
        return await generatePixelDiffHeatmap(renderSnap, targetSnap);
    }
}

