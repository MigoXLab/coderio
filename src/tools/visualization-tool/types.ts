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

/**
 * Result from generating iteration screenshot with individual annotated screenshots.
 * Used to save individual screenshots for report reuse while keeping combined screenshot for judger.
 */
export interface IterationScreenshotResult {
    /** Base64 data URI - annotated browser screenshot */
    renderMarked: string;
    /** Base64 data URI - annotated Figma screenshot */
    targetMarked: string;
    /** Path to combined side-by-side screenshot (for judger visual context) */
    combinedPath: string;
}
