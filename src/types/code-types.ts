/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Core types for code generation
 */

/**
 * Basic tree node structure with optional children
 */
export type BasicTreeNode<T> = T & {
    children?: BasicTreeNode<T>[] | null;
};

/**
 * Frame structure data wrapper
 */
type FrameStructureData<T> = {
    id: string;
    data: T;
};

/**
 * Generic tree node with id, data, and status
 */
export type TreeNode<T> = BasicTreeNode<FrameStructureData<T>>;

/**
 * Tree node with parent reference
 */
export type TreeNodeWithParent<T> = BasicTreeNode<FrameStructureData<T> & { parent: TreeNodeWithParent<T> | null }>;

/**
 * Frame data containing component information
 */
export interface FrameData {
    name: string;
    purpose: string;
    elementIds: string[];
    path?: string;
    componentName?: string;
    componentPath?: string;
    componentProperties?: Record<string, unknown>;
    layout?: Record<string, unknown>;
}

/**
 * Frame structure node type (used for page structure tree)
 */
export type FrameStructNodeV2 = TreeNode<FrameData>;

/**
 * Figma frame information
 */
export interface FigmaFrameInfo {
    id?: string;
    name: string;
    type?: string;
    frames?: FigmaFrameInfo[];
    children?: FigmaFrameInfo[];
    thumbnailUrl?: string;
    url?: string;
    realPath?: string;
    absoluteBoundingBox: FigmaPositionAndSize;
    inlineStyles?: Record<string, unknown>;
    scrollBehavior?: string;
    blendMode?: string;
    fills?: any[];
    strokes?: any[];
    strokeWeight?: number;
    strokeAlign?: string;
    styles?: Record<string, unknown>;
    absoluteRenderBounds?: FigmaPositionAndSize;
    constraints?: {
        vertical?: string;
        horizontal?: string;
    };
    characters?: string;
    characterStyleOverrides?: any[];
    styleOverrideTable?: Record<string, unknown>;
    lineTypes?: string[];
    lineIndentations?: number[];
    style?: Record<string, unknown>;
    layoutVersion?: number;
    effects?: any[];
    interactions?: any[];
    cornerSmoothing?: number;
    clipsContent?: boolean;
    exportSettings?: any[];
    backgroundColor?: any;
}

interface FigmaPositionAndSize {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Processed Figma data
 */
export interface ProcessedFigma {
    frames: FigmaFrameInfo[];
    thumbnailUrl?: string;
}

/**
 * Child output pairing
 */
export interface ChildOutput<T, U> {
    node: TreeNode<T>;
    output: U;
}
