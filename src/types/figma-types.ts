/**
 * Figma API Types
 *
 * Type definitions for Figma file, node, and design data structures.
 * Based on Figma REST API specification.
 *
 * @see {@link https://developers.figma.com/docs/rest-api/ Figma REST API}
 */
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
    thumbnailUrl?: string;
    name: string;
    visible: boolean;
    type: string;
    scrollBehavior: string;
    children?: FigmaFrameInfo[];
    characters?: string;
    frames?: FigmaFrameInfo[];
    blendMode: string;
    clipsContent: boolean;
    layoutMode?: string; // 'HORIZONTAL' | 'VERTICAL' | 'NONE'
    background: FigmaColorObject[];
    fills: FigmaColorObject[];
    strokes: FigmaColorObject[];
    strokeWeight: number;
    cornerRadius: number;
    rectangleCornerRadii: number[];
    strokeAlign: string;
    backgroundColor: FigmaColor;
    absoluteBoundingBox: FigmaPositionAndSize;
    absoluteRenderBounds: FigmaPositionAndSize;
    constraints: {
        vertical: string;
        horizontal: string;
    };
    exportSettings: [
        {
            suffix: string;
            format: string;
            constraint: {
                type: string;
                value: number;
            };
        },
    ];
    style?: FigmaTextStyle;
    inlineStyles?: CSSStyles;
}

export type LayoutDirection = 'VERTICAL' | 'HORIZONTAL' | 'NONE';

export interface FrameData<TProps = Record<string, unknown>> {
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
     * Optional props object for this reusable component instance.
     * This will be generated at Code node time and consumed by frame generation.
     */
    componentProperties?: TProps;
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
 *
 * Represents a single component in the UI hierarchy, including its layout,
 * Figma elements, and nested child components.
 *
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
export interface FrameStructNode<TProps = Record<string, unknown>> {
    /** Unique component identifier (e.g., "Header", "ProductCard") */
    id: string;

    /** Component business data (layout, elements, paths, etc.) */
    data: FrameData<TProps>;
    /** Nested child components */
    children?: FrameStructNode<TProps>[] | null;
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
    parentRelativeOffset: ParentRelativeOffset;
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

/**
 * Parent-relative offset
 * Pre-computed offset from parent's bounding box origin
 * Replaces need for AI to subtract rootBoundingBox - parentRootBoundingBox
 */
interface ParentRelativeOffset {
    x: number;
    y: number;
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
    parentRelativeOffset: ParentRelativeOffset;
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

/**
 * Parent-relative offset
 * Pre-computed offset from parent's bounding box origin
 * Replaces need for AI to subtract rootBoundingBox - parentRootBoundingBox
 */
interface ParentRelativeOffset {
    x: number;
    y: number;
}
