/**
 * Position validation for a single iteration.
 * Captures browser positions, groups by component, identifies misaligned components.
 */

import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../../../utils/logger';
import { PositionTool } from '../../../tools/position-tool';
import { VisualizationTool } from '../../../tools/visualization-tool';
import type { MisalignedComponentData } from '../../../tools/visualization-tool/types';
import type { FrameStructNode } from '../../../types/figma-types';
import type { MisalignedComponent, SkippedElement } from '../types';
import { ReportTool } from '../../../tools/report-tool';
import type { ValidationContext, ElementMetadataRegistry } from '../../../types/validation-types.js';

/**
 * Configuration for validation iteration
 */
export interface ValidationIterationConfig {
    serverUrl: string;
    figmaThumbnailUrl: string;
    protocol: FrameStructNode;
    iteration: number;
    positionThreshold: number;
    designOffset: [number, number];
    outputDir: string;
    /** Unified validation context containing all Figma data with normalized positions */
    validationContext: ValidationContext;
    /** Unified element registry containing all element metadata (eliminates tree traversals) */
    elementRegistry: ElementMetadataRegistry;
    /** Pre-cached Figma thumbnail base64 data to avoid redundant downloads. */
    cachedFigmaThumbnailBase64?: string;
}

/**
 * Result from validating positions in a single iteration
 */
export interface ValidationIterationResult {
    mae: number;
    misalignedComponents: MisalignedComponent[];
    comparisonScreenshotPath: string;
    skippedElements: SkippedElement[];
}

/**
 * Generate comparison screenshot for misaligned components.
 * Returns empty string on failure (non-blocking error).
 */
async function generateIterationScreenshot(
    misalignedComponents: MisalignedComponent[],
    serverUrl: string,
    figmaThumbnailUrl: string,
    viewport: { width: number; height: number },
    designOffset: [number, number],
    outputDir: string,
    iteration: number,
    cachedFigmaThumbnailBase64?: string
): Promise<string> {
    if (misalignedComponents.length === 0) {
        return '';
    }

    try {
        logger.printTestLog(`Generating annotated screenshots for iteration ${iteration}`);

        const comparisonDir = path.join(outputDir, 'comparison_screenshots');
        if (!fs.existsSync(comparisonDir)) {
            fs.mkdirSync(comparisonDir, { recursive: true });
        }

        const reportTool = new ReportTool();
        const misalignedDataUnknown: unknown = reportTool.formatMisalignedData(misalignedComponents);
        const misalignedData = misalignedDataUnknown as MisalignedComponentData[];
        const visualizationTool = new VisualizationTool();
        const render = await visualizationTool.annotateRender(serverUrl, misalignedData, viewport);

        // Use cached thumbnail if available to avoid redundant downloads
        const targetMarked = cachedFigmaThumbnailBase64
            ? await visualizationTool.annotateTargetFromBase64(cachedFigmaThumbnailBase64, misalignedData, viewport, {
                  x: designOffset[0],
                  y: designOffset[1],
              })
            : await visualizationTool.annotateTarget(figmaThumbnailUrl, misalignedData, viewport, {
                  x: designOffset[0],
                  y: designOffset[1],
              });

        const screenshotPath = path.join(comparisonDir, `iteration_${iteration}.webp`);
        await visualizationTool.combine(render.renderMarked, targetMarked, screenshotPath);

        logger.printLog(`Saved comparison screenshot: ${path.basename(screenshotPath)}`);
        return screenshotPath;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.printWarnLog(`Failed to generate iteration screenshot: ${errorMsg}. Continuing validation without screenshot.`);
        return '';
    }
}

/**
 * Validate positions by capturing browser positions and comparing with Figma.
 * This function integrates with the existing captureBrowserPositions tool
 * and transforms its output into the format expected by the validation loop.
 *
 * @param config - Validation iteration configuration
 * @returns Validation result with MAE, misaligned components, and screenshot path
 */
export async function validatePositions(config: ValidationIterationConfig): Promise<ValidationIterationResult> {
    const {
        serverUrl,
        figmaThumbnailUrl,
        protocol,
        iteration,
        positionThreshold,
        designOffset,
        outputDir,
        validationContext,
        elementRegistry,
    } = config;

    const positionTool = new PositionTool();

    logger.printTestLog('validatePositions: Calling PositionTool.capturePosition...');

    // Type assertion: captureBrowserPositions accepts flexible input types for compatibility
    const captureResult = await positionTool.capturePosition({
        protocol,
        validationContext,
        url: serverUrl,
        figmaThumbnailUrl,
        positionThreshold,
        returnScreenshot: false,
        elementRegistry,
    });

    // Use element-to-component mapping from validation context
    const elementToComponent = validationContext.elementToComponent;

    const aggregated = positionTool.aggregateElements(captureResult.positions, elementToComponent, positionThreshold);
    const misalignedComponents = aggregated.misalignedComponents as unknown as MisalignedComponent[];
    const skippedElements = aggregated.skippedElements as unknown as SkippedElement[];

    logger.printTestLog(`validatePositions: Found ${misalignedComponents.length} misaligned components`);

    // Generate iteration screenshot
    const comparisonScreenshotPath = await generateIterationScreenshot(
        misalignedComponents,
        serverUrl,
        figmaThumbnailUrl,
        captureResult.metadata.viewport,
        designOffset,
        outputDir,
        iteration,
        config.cachedFigmaThumbnailBase64
    );

    return {
        mae: captureResult.metadata.mae,
        misalignedComponents,
        comparisonScreenshotPath,
        skippedElements,
    };
}
