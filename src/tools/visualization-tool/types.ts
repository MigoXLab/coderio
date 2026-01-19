/**
 * Shared types for visualization/annotation tooling.
 *
 * Kept separate from position capture/metrics so visualization can evolve independently.
 */

/**
 * Derived type for visualization/annotation of misaligned components.
 */
export interface MisalignedComponentData {
    index: number; // 1-based index for numbering in UI
    elementId: string; // Figma element ID
    elementName?: string;
    componentId: string;
    componentName: string;
    componentPath: string;
    currentX: number;
    currentY: number;
    currentWidth: number;
    currentHeight: number;
    targetX: number;
    targetY: number;
    targetWidth: number;
    targetHeight: number;
    distance: number;
    xDelta: number;
    yDelta: number;
}

export interface CombineOptions {
    leftHeader?: string;
    rightHeader?: string;
    gapWidth?: number;
    headerHeight?: number;
}

export interface AnnotateRenderResult {
    renderSnap: string;
    renderMarked: string;
}
