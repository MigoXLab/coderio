/**
 * Shared annotation styling utilities for visualization.
 * Provides consistent styling for position validation annotations.
 */

/** Annotation colors */
export const ANNOTATION_COLORS = {
    RED: '#ef4444', // Tailwind red-500 - for current/render positions
    GREEN: '#22c55e', // Tailwind green-500 - for target/expected positions
} as const;

/** Annotation box position data */
export interface AnnotationBoxData {
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    distance?: number;
}

/**
 * Creates the CSS for an annotation container that overlays the page.
 */
export function createContainerStyle(): string {
    return `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
    `;
}

/**
 * Creates the CSS for an annotation box at the specified position.
 */
export function createBoxStyle(x: number, y: number, width: number, height: number, color: string): string {
    return `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
        border: 4px solid ${color};
        box-sizing: border-box;
        pointer-events: none;
    `;
}

/**
 * Creates the CSS for a numbered circle label.
 * Clamps to at least 5px from edges to prevent cutoff (mirrors Python implementation).
 */
export function createCircleLabelStyle(x: number, y: number, color: string): string {
    const labelX = Math.max(5, x - 22);
    const labelY = Math.max(5, y - 22);

    return `
        position: absolute;
        left: ${labelX}px;
        top: ${labelY}px;
        background: ${color};
        color: white;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font: bold 18px Arial, sans-serif;
        border-radius: 50%;
        pointer-events: none;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
}

/**
 * Creates the CSS for a text label positioned below the box.
 */
export function createTextLabelStyle(x: number, y: number, height: number, color: string): string {
    return `
        position: absolute;
        left: ${x}px;
        top: ${y + height + 4}px;
        background: ${color};
        color: white;
        padding: 4px 8px;
        font: 12px Arial, sans-serif;
        border-radius: 4px;
        pointer-events: none;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
}
