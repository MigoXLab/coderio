/**
 * Public types for the PositionTool module.
 *
 * This file mirrors the structure of `src/tools/visualization/types.ts`:
 * - Public, stable types live here
 * - Internal utils may re-export from here via `utils/types.ts`
 */

import type { Protocol } from '../../types/protocol-types';
import type { ElementMetadataRegistry, ValidationContext } from '../../types/validation-types';
import type { ComponentAggregationData } from './utils/aggregate-elements';

/**
 * Input for capturing browser positions.
 */
export interface BrowserPositionInput {
    /** Protocol structure tree */
    protocol: Protocol;
    /** Unified validation context containing all Figma data with normalized positions */
    validationContext: ValidationContext;
    url: string;
    figmaThumbnailUrl: string;
    /**
     * Unified element registry containing all element metadata (eliminates tree traversals).
     * When provided, position capture uses this instead of building registry internally.
     */
    elementRegistry: ElementMetadataRegistry;
    /**
     * Threshold (pixels) used to classify element `metrics.status` as accurate vs misaligned.
     */
    positionThreshold?: number;
    waitForSelector?: string;
    timeout?: number;
    returnScreenshot?: boolean;
    viewport?: { width: number; height: number };
}

export interface PositionMetrics {
    xOffset: number;
    yOffset: number;
    xDelta: number;
    yDelta: number;
    absoluteDistance: number;
    status: 'accurate' | 'misaligned' | 'cannot_compare';
}

export type ValidationItemType = 'frame' | 'component' | 'element';

export interface ElementAbsolutePosition {
    elementId: string;
    elementName?: string;
    parentItemId?: string;
    parentItemName?: string;
    parentItemType?: ValidationItemType;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
    computedStyle?: {
        position: string;
        display: string;
        top: string;
        left: string;
        right: string;
        bottom: string;
        transform: string;
        tagName: string;
    };
    figmaPosition?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    metrics?: PositionMetrics;
}

export interface ValidationMetrics {
    mae: number;
    mse: number;
    rmse: number;
    accurateItems: number;
    misalignedItems: number;
    comparableItems: number;
    accuracyRate: number;
    averageDistance: number;
    maxDistance: number;
}

export interface PositionValidationOutput {
    metadata: {
        capturedAt: string;
        totalItems: number;
        capturedItems: number;
        comparableItems: number;
        accurateItems: number;
        misalignedItems: number;
        accuracyRate: number;
        averageDistance: number;
        maxDistance: number;
        mae: number;
        mse: number;
        rmse: number;
        url: string;
        viewport: { width: number; height: number };
        designOffset?: { x: number; y: number };
    };
    positions: Record<string, ElementAbsolutePosition>;
    errors: string[];
    screenshot?: string;
}

// ---- PositionTool aggregation + outputs ----

export interface SkippedElement {
    elementId: string;
    reason: 'missing_component_mapping' | 'incomplete_data' | 'no_figma_position';
    details?: string;
}

export interface ComponentValidationReport {
    currentPosition: [number, number];
    targetPosition: [number, number];
    absoluteError: [number, number];
}

export interface ComponentMisalignment {
    name: string;
    componentId: string;
    elementIds: string[];
    path: string;
    validationReport: ComponentValidationReport;
    currentX: number;
    currentY: number;
    targetX: number;
    targetY: number;
    currentWidth: number;
    currentHeight: number;
    targetWidth: number;
    targetHeight: number;
    distance: number;
}

export interface AggregateElementsResult {
    misalignedComponents: ComponentMisalignment[];
    skippedElements: SkippedElement[];
}

export interface PositionToolMetrics extends ValidationMetrics {
    /**
     * Sum Absolute Error at component-level (Σ(|Δx|+|Δy|) over misaligned components).
     */
    sae: number;
}

export interface ComponentData extends ComponentAggregationData {
    componentId: string;
    componentName: string;
    componentPath: string;
    elementIds: string[];
    errors: { x: number; y: number }[];
}

export type ElementToComponent = Map<string, { id: string; name: string; path: string }>;

export type { BoundingBox, ComponentAggregationData, PositionError, Rectangle } from './utils/aggregate-elements';
