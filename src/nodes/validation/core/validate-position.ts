/**
 * Position validation for a single iteration.
 * Captures browser positions, groups by component, identifies misaligned components.
 */

import { logger } from '../../../utils/logger';
import { PositionTool } from '../../../tools/position-tool';
import type { ValidationIterationConfig, ValidationIterationResult, MisalignedComponent, SkippedElement } from '../types';

/**
 * Validate positions by capturing browser positions and comparing with Figma.
 * This function integrates with the existing captureBrowserPositions tool
 * and transforms its output into the format expected by the validation loop.
 *
 * @param config - Validation iteration configuration
 * @returns Validation result with MAE, SAE, misaligned components, and viewport
 */
export async function validatePositions(config: ValidationIterationConfig): Promise<ValidationIterationResult> {
    const { serverUrl, figmaThumbnailUrl, protocol, positionThreshold, validationContext, elementRegistry, resolvedComponentPaths } =
        config;

    const positionTool = new PositionTool();

    // Type assertion: captureBrowserPositions accepts flexible input types for compatibility
    const captureResult = await positionTool.capturePosition({
        protocol,
        validationContext,
        url: serverUrl,
        figmaThumbnailUrl,
        positionThreshold,
        returnScreenshot: true,
        elementRegistry,
    });

    // Create resolved elementToComponent mapping with absolute paths
    // Replace alias paths with absolute filesystem paths from resolvedComponentPaths
    const resolvedElementToComponent = new Map<string, { id: string; name: string; path: string }>();
    for (const [elementId, componentInfo] of validationContext.elementToComponent) {
        const resolvedPath = resolvedComponentPaths[componentInfo.id] || componentInfo.path;
        resolvedElementToComponent.set(elementId, {
            id: componentInfo.id,
            name: componentInfo.name,
            path: resolvedPath,
        });
    }

    const aggregated = positionTool.aggregateElements(captureResult.positions, resolvedElementToComponent, positionThreshold);
    const misalignedComponents = aggregated.misalignedComponents as unknown as MisalignedComponent[];
    const skippedElements = aggregated.skippedElements as unknown as SkippedElement[];

    // Calculate SAE
    const sae = misalignedComponents.reduce((sum, comp) => {
        const [errorX, errorY] = comp.validationReport.absoluteError;
        return sum + errorX + errorY;
    }, 0);

    logger.printInfoLog(`Found ${misalignedComponents.length} misaligned components`);

    return {
        mae: captureResult.metadata.mae,
        sae,
        misalignedComponents,
        skippedElements,
        viewport: captureResult.metadata.viewport,
        screenshots: captureResult.screenshot
            ? {
                  renderSnap: captureResult.screenshot,
              }
            : undefined,
    };
}
