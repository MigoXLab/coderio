import { tools } from 'evoltagent';

import { logger } from '../../utils/logger';
import { captureBrowserPositions } from './utils/capture-position';
import { calculatePositionMetrics } from './utils/position-metrics';
import { calculateComponentMetrics } from './utils/aggregate-elements';
import type {
    AggregateElementsResult,
    BrowserPositionInput,
    ComponentData,
    ComponentMisalignment,
    ElementAbsolutePosition,
    PositionToolMetrics,
    PositionValidationOutput,
    SkippedElement,
} from './types';
import { toRect } from './utils/rect';

@tools({
    capturePosition: {
        description:
            'Capture viewport-relative positions in the browser and compare to Figma absoluteBoundingBox, returning per-element deltas and metrics.',
        params: [{ name: 'input', type: 'object', description: 'BrowserPositionInput (figmaJSON, structure, url, etc.)' }],
        returns: { type: 'object', description: 'PositionValidationOutput containing metadata, positions, and errors.' },
    },
    aggregateElements: {
        description:
            'Aggregate element-level rectangles into component-level bounds and return misaligned components based on aggregate distance threshold.',
        params: [
            { name: 'positions', type: 'object', description: 'Positions keyed by elementId (from capturePosition).' },
            {
                name: 'elementToComponentMap',
                type: 'object',
                description: 'Mapping from elementId -> {id,name,path} for parent component (built from structure tree).',
            },
            { name: 'positionThreshold', type: 'number', description: 'Pixel threshold for aggregate distance.' },
        ],
        returns: { type: 'object', description: 'AggregateElementsResult: misalignedComponents + skippedElements.' },
    },
    computeMetrics: {
        description: 'Compute MAE/MSE/RMSE/accuracy metrics from element positions, and SAE from component misalignments.',
        params: [
            { name: 'positions', type: 'object', description: 'Positions keyed by elementId (from capturePosition).' },
            {
                name: 'misalignedComponents',
                type: 'object',
                description: 'Optional component misalignments (from aggregateElements) used to compute SAE.',
                optional: true,
            },
        ],
        returns: { type: 'object', description: 'PositionToolMetrics (ValidationMetrics + sae).' },
    },
})
export class PositionTool {
    async capturePosition(input: BrowserPositionInput): Promise<PositionValidationOutput> {
        return await captureBrowserPositions(input);
    }

    /**
     * Deterministic in-process aggregation.
     * NOTE: Map-based inputs are not JSON-friendly for future agent calls; we can add a JSON form later.
     */
    aggregateElements(
        positions: Record<string, ElementAbsolutePosition>,
        elementToComponentMap: Map<string, { id: string; name: string; path: string }>,
        positionThreshold: number
    ): AggregateElementsResult {
        const componentMap = new Map<string, ComponentData>();
        const skippedElements: SkippedElement[] = [];

        for (const [elementId, position] of Object.entries(positions)) {
            if (!position.figmaPosition) {
                skippedElements.push({
                    elementId,
                    reason: 'no_figma_position',
                    details: 'Element exists in render but has no corresponding Figma position data',
                });
                continue;
            }

            const component = elementToComponentMap.get(elementId);
            if (!component) {
                skippedElements.push({
                    elementId,
                    reason: 'missing_component_mapping',
                    details: 'Element has no component mapping in structure tree',
                });
                continue;
            }

            if (!componentMap.has(component.id)) {
                componentMap.set(component.id, {
                    componentId: component.id,
                    componentName: component.name,
                    componentPath: component.path,
                    elementIds: [],
                    positions: [],
                    targets: [],
                    errors: [],
                });
            }

            const compData = componentMap.get(component.id)!;
            compData.elementIds.push(elementId);
            compData.positions.push(toRect(position.boundingBox));
            compData.targets.push(toRect(position.figmaPosition));
            compData.errors.push({
                x: Math.abs(position.metrics?.xDelta ?? 0),
                y: Math.abs(position.metrics?.yDelta ?? 0),
            });
        }

        this.logSkippedElementsSummary(skippedElements);

        const misalignedComponents: ComponentMisalignment[] = [];

        for (const compData of componentMap.values()) {
            if (compData.positions.length === 0 || compData.targets.length === 0) {
                for (const elemId of compData.elementIds) {
                    skippedElements.push({
                        elementId: elemId,
                        reason: 'incomplete_data',
                        details: `Component ${compData.componentName} has ${compData.positions.length} positions, ${compData.targets.length} targets`,
                    });
                }
                continue;
            }

            const metrics = calculateComponentMetrics(compData, positionThreshold);
            if (!metrics) {
                continue;
            }

            const { currentBounds, targetBounds, error } = metrics;
            misalignedComponents.push({
                name: compData.componentName,
                componentId: compData.componentId,
                elementIds: compData.elementIds,
                path: compData.componentPath,
                validationReport: {
                    currentPosition: [currentBounds.minX, currentBounds.minY],
                    targetPosition: [targetBounds.minX, targetBounds.minY],
                    absoluteError: [error.errorX, error.errorY],
                },
                currentX: currentBounds.minX,
                currentY: currentBounds.minY,
                targetX: targetBounds.minX,
                targetY: targetBounds.minY,
                currentWidth: currentBounds.width,
                currentHeight: currentBounds.height,
                targetWidth: targetBounds.width,
                targetHeight: targetBounds.height,
                distance: error.distance,
            });
        }

        return { misalignedComponents, skippedElements };
    }

    computeMetrics(
        positions: Record<string, ElementAbsolutePosition>,
        misalignedComponents?: ComponentMisalignment[]
    ): PositionToolMetrics {
        const metrics = calculatePositionMetrics(positions);
        const sae =
            misalignedComponents?.reduce((sum, comp) => {
                const [errorX, errorY] = comp.validationReport.absoluteError;
                return sum + errorX + errorY;
            }, 0) ?? 0;

        return { ...metrics, sae: Math.round(sae * 100) / 100 };
    }

    private logSkippedElementsSummary(skippedElements: SkippedElement[]): void {
        if (skippedElements.length === 0) {
            return;
        }

        const byReason: Record<SkippedElement['reason'], number> = {
            missing_component_mapping: 0,
            incomplete_data: 0,
            no_figma_position: 0,
        };

        for (const elem of skippedElements) {
            byReason[elem.reason] += 1;
        }

        const summary = (Object.entries(byReason) as Array<[SkippedElement['reason'], number]>)
            .filter(([, count]) => count > 0)
            .map(([reason, count]) => `${count} ${reason.replace(/_/g, ' ')}`)
            .join(', ');

        const firstFew = skippedElements
            .slice(0, 3)
            .map(e => e.elementId)
            .join(', ');

        logger.printWarnLog(`Skipped ${skippedElements.length} element(s): ${summary}. First few: ${firstFew}`);
    }
}
