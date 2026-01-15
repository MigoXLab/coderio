import type { FrameStructNode, FigmaPositionAndSize } from '../../../types/figma-types';

/**
 * Simplified Figma node structure for content extraction.
 */
export interface SimplifiedFigmaNode {
    id: string;
    name: string;
    type: string;
    url?: string;
    cornerRadius?: number;
    characters?: string;
    visible?: boolean;
    absoluteBoundingBox?: FigmaPositionAndSize;
    children?: SimplifiedFigmaNode[];
    inlineStyles?: Record<string, unknown>;
    componentProperties?: Record<string, unknown>;
    style?: Record<string, unknown>;
    hasStrokes?: boolean;
}

/**
 * Extended node type with potential top-level componentName (non-standard AI format).
 */
export interface ExtendedFrameStructNode extends FrameStructNode {
    componentName?: string;
}

/**
 * Parsed data list response from AI model.
 */
export interface ParsedDataListResponse {
    state?: Array<Record<string, unknown>>;
    props?: Array<{ key: string; type: string; description: string }>;
}

export interface AnnotateStructureOptions {
    injectMode?: boolean;
}

