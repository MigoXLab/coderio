import { tools } from 'evoltagent';
import * as path from 'path';

import type { AnnotateRenderResult, CombineOptions, MisalignedComponentData, IterationScreenshotResult } from './types';
import type { MisalignedComponent } from '../../types/validation-types';
import { annotateRenderWithPlaywright } from './utils/annotate-render';
import { annotateTargetWithPlaywright } from './utils/annotate-target';
import { browserManagement } from './utils/browser-management';
import { combineSideBySide } from './utils/combine';
import { captureAsWebP } from './utils/image-converter';
import { generatePixelDiffHeatmap } from './utils/pixel-diff-heatmap';
import { logger } from '../../utils/logger';

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
    annotateTargetFromBase64: {
        description: 'Annotate target using pre-cached base64 thumbnail data. Use this to avoid redundant Figma thumbnail downloads.',
        params: [
            { name: 'figmaThumbnailBase64', type: 'string', description: 'Base64-encoded Figma thumbnail data.' },
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
    generateIterationScreenshot: {
        description: 'Generate annotated comparison screenshot for validation iteration. Orchestrates annotate + combine for convenience.',
        params: [
            { name: 'misalignedComponents', type: 'object', description: 'MisalignedComponent[] from validation result' },
            { name: 'serverUrl', type: 'string', description: 'Dev server URL' },
            { name: 'figmaThumbnailUrl', type: 'string', description: 'Figma thumbnail URL' },
            { name: 'viewport', type: 'object', description: 'Viewport {width, height}' },
            { name: 'designOffset', type: 'object', description: 'Design offset {x, y}' },
            { name: 'outputPath', type: 'string', description: 'Output file path for combined screenshot' },
            {
                name: 'cachedFigmaThumbnailBase64',
                type: 'string',
                description: 'Optional cached thumbnail base64',
                optional: true,
            },
        ],
        returns: { type: 'object', description: 'IterationScreenshotResult with renderMarked, targetMarked, and combinedPath' },
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

        return await browserManagement(viewport, async browser => {
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
        return await browserManagement(viewport, async browser => {
            return await annotateTargetWithPlaywright(browser, figmaThumbnailBase64, misalignedData, viewport, designOffset);
        });
    }

    async combine(renderMarked: string, targetMarked: string, outputPath: string, options?: CombineOptions): Promise<string> {
        await combineSideBySide(renderMarked, targetMarked, outputPath, options);
        return outputPath;
    }

    async diffHeatmap(renderSnap: string, targetSnap: string): Promise<string> {
        return await generatePixelDiffHeatmap(renderSnap, targetSnap);
    }

    /**
     * Generate annotated comparison screenshot for a single iteration.
     * This is a convenience method that orchestrates the full screenshot workflow.
     *
     * @returns IterationScreenshotResult with individual annotated screenshots and combined path
     */
    async generateIterationScreenshot(
        misalignedComponents: MisalignedComponent[],
        serverUrl: string,
        figmaThumbnailUrl: string,
        viewport: { width: number; height: number },
        designOffset: { x: number; y: number },
        outputPath: string,
        cachedFigmaThumbnailBase64?: string
    ): Promise<IterationScreenshotResult> {
        if (misalignedComponents.length === 0) {
            return { renderMarked: '', targetMarked: '', combinedPath: '' };
        }

        try {
            // Transform validation data to visualization format
            const misalignedData = this.formatForVisualization(misalignedComponents);

            // Annotate render (browser screenshot)
            const render = await this.annotateRender(serverUrl, misalignedData, viewport);

            // Annotate target (Figma screenshot) - use cached thumbnail if available
            const targetMarked = cachedFigmaThumbnailBase64
                ? await this.annotateTargetFromBase64(cachedFigmaThumbnailBase64, misalignedData, viewport, designOffset)
                : await this.annotateTarget(figmaThumbnailUrl, misalignedData, viewport, designOffset);

            // Combine into side-by-side comparison (needed for judger visual context in next iteration)
            await this.combine(render.renderMarked, targetMarked, outputPath);

            logger.printInfoLog(`Saved comparison screenshot: ${path.basename(outputPath)}`);
            return {
                renderMarked: render.renderMarked,
                targetMarked,
                combinedPath: outputPath,
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger.printWarnLog(`Failed to generate iteration screenshot: ${errorMsg}`);
            return { renderMarked: '', targetMarked: '', combinedPath: '' };
        }
    }

    /**
     * Transform MisalignedComponent[] to MisalignedComponentData[] format.
     * This is an internal helper for converting validation results to visualization format.
     */
    private formatForVisualization(components: MisalignedComponent[]): MisalignedComponentData[] {
        return components.map((comp, idx) => {
            if (comp.elementIds.length === 0) {
                logger.printWarnLog(`Component ${comp.name} has no elementIds. Using componentId as fallback.`);
            }

            return {
                index: idx + 1,
                elementId: comp.elementIds[0] || comp.componentId,
                elementName: comp.name,
                componentId: comp.componentId,
                componentName: comp.name,
                componentPath: comp.path,
                currentX: comp.currentX,
                currentY: comp.currentY,
                currentWidth: comp.currentWidth,
                currentHeight: comp.currentHeight,
                targetX: comp.targetX,
                targetY: comp.targetY,
                targetWidth: comp.targetWidth,
                targetHeight: comp.targetHeight,
                distance: comp.distance,
                xDelta: comp.validationReport.absoluteError[0],
                yDelta: comp.validationReport.absoluteError[1],
            };
        });
    }
}
