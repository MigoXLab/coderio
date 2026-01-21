/**
 * Figma API Types
 *
 * Type definitions for Figma file, node, and design data structures.
 * Based on Figma REST API specification.
 *
 * @see {@link https://developers.figma.com/docs/rest-api/ Figma REST API}
 */

/* URL and File Information */
export interface FigmaUrlInfo {
    fileId: string | null; // The ID of the Figma file.
    name: string; // The name of the Figma file.
    nodeId: string | null; // The ID of the Figma node.
    projectName: string | null; // The name of the project.
}

export interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface FigmaGradientStop {
    color: FigmaColor;
    position: number;
}

export interface FigmaColorObject {
    blendMode?: string;
    visible?: boolean;
    type: string;
    color?: FigmaColor;
    opacity?: number;
    gradientStops?: FigmaGradientStop[];
    gradientHandlePositions?: { x: number; y: number }[];
    imageRef?: string;
}

export interface FigmaPositionAndSize {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface FigmaTextStyle {
    fontFamily: string;
    fontPostScriptName: string;
    fontStyle: string;
    fontWeight: number;
    textAutoResize: string;
    fontSize: number;
    textAlignHorizontal: string;
    textAlignVertical: string;
    letterSpacing: number;
    lineHeightPx: number;
    lineHeightPercent: number;
    lineHeightPercentFontSize: number;
    lineHeightUnit: string;
}

export interface CSSStyles {
    position?: string;
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
    padding?: string;
    paddingLeft?: string;
    paddingRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    background?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    opacity?: string | number;
    backdropFilter?: string;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: string;
    overflow?: string;
    [key: string]: string | number | undefined;
}

export interface FigmaFrameInfo {
    id: string;
    name: string;
    type: string;
    url?: string;
    thumbnailUrl?: string;
    visible?: boolean;
    scrollBehavior?: string;
    children?: FigmaFrameInfo[];
    characters?: string;
    frames?: FigmaFrameInfo[];
    blendMode?: string;
    clipsContent?: boolean;
    layoutMode?: string; // 'HORIZONTAL' | 'VERTICAL' | 'NONE'
    primaryAxisAlignItems?: string; // Auto-layout: main axis alignment
    counterAxisAlignItems?: string; // Auto-layout: cross axis alignment
    itemSpacing?: number; // Auto-layout: gap between items
    paddingTop?: number; // Auto-layout padding
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    background?: FigmaColorObject[];
    fills?: FigmaColorObject[];
    strokes?: FigmaColorObject[];
    strokeWeight?: number;
    cornerRadius?: number;
    rectangleCornerRadii?: number[];
    strokeAlign?: string;
    backgroundColor?: FigmaColor;
    absoluteBoundingBox: FigmaPositionAndSize;
    absoluteRenderBounds?: FigmaPositionAndSize;
    constraints?: {
        vertical: string;
        horizontal: string;
    };
    exportSettings?: [
        {
            suffix: string;
            format: FigmaImageFormat;
            constraint: {
                type: string;
                value: number;
            };
        },
    ];
    style?: FigmaTextStyle;
    inlineStyles?: CSSStyles;
    effects?: {
        type: string; // 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
        visible?: boolean;
        radius: number;
        color?: FigmaColor;
        offset?: {
            x: number;
            y: number;
        };
        spread?: number;
    }[];
}

export enum FigmaImageFormat {
    PNG = 'png',
    JPG = 'jpg',
    SVG = 'svg',
    PDF = 'pdf',
    EPS = 'eps',
    WEBP = 'webp',
}

export type LayoutDirection = 'VERTICAL' | 'HORIZONTAL' | 'NONE';

export interface FrameData {
    name: string;
    purpose: string;
    elements: unknown[]; // Complete Figma node data with hierarchy (simplified)
    kebabName?: string; // Normalized identifier for filesystem-friendly names
    /**
     * Optional reusable component identifier.
     * When present, this node is an instance of a reusable component (e.g. "TaskCard", "FeatureCard").
     */
    componentName?: string;
    componentPath?: string; // Derived slug for file system paths
    /**
     * Props schema definition for reusable component template.
     * Defines the formal parameters (key, type, description) for the component.
     */
    props?: Array<{ key: string; type: string; description: string }>;
    /**
     * Array of component states with their data lists.
     * Each entry contains: state array (actual parameter values), componentName, and componentPath.
     */
    states?: Array<{
        state: Array<Record<string, unknown>>;
        componentName: string;
        componentPath: string;
    }>;
    path?: string; // Derived slug for file system paths
    layout?: EmbeddedLayoutInfo;
}

/**
 * Component Structure Node
 *
 * Represents a single component in the UI hierarchy, including its layout,
 * Figma elements, and nested child components.
 *
 * @example
 * ```typescript
 * const header: FrameStructNode = {
 *   id: "Header",
 *   data: {
 *     name: "Header",
 *     layout: { ... },
 *     elements: [ ... ]
 *   },
 *   children: [
 *     { id: "Logo", data: { ... }, children: [] }
 *   ]
 * }
 * ```
 */
export interface FrameStructNode {
    /** Unique component identifier (e.g., "Header", "ProductCard") */
    id: string;

    /** Component business data (layout, elements, paths, etc.) */
    data: FrameData;

    /** Nested child components */
    children?: FrameStructNode[] | null;
}

/**
 * Embedded layout information
 * Direct layout data attached to each node in structure tree
 * Eliminates need for separate LayoutMeasurementProvider lookups
 */
interface EmbeddedLayoutInfo {
    /** Position and size in CSS coordinates */
    boundingBox: CssBoundingBox;
    /** Position and size relative to parent component */
    relativeBoundingBox?: CssBoundingBox;
    /** Computed layout direction based on children positions */
    layoutDirection: LayoutDirection;
    /** Gap to previous and next siblings */
    spacing: {
        previous?: number;
        next?: number;
    };
    /** Pre-computed offset from parent's bounding box */
    parentRelativeOffset: {
        x: number;
        y: number;
    };
}

/**
 * Bounding box with position and size using CSS coordinate naming (top, left)
 */
interface CssBoundingBox {
    top: number;
    left: number;
    width: number;
    height: number;
}
