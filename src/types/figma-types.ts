/**
 * Figma API Types
 *
 * Type definitions for Figma file, node, and design data structures.
 * Based on Figma REST API specification.
 *
 * @see Figma
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

export interface FrameData {
    name: string;
    purpose: string;
    elementIds?: string[]; // Temporary IDs from AI response (removed after processing)
    elements: any[]; // Complete Figma node data with hierarchy (simplified)
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
    componentProperties?: Record<string, unknown>;
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
        state: unknown[];
        componentName: string;
        componentPath: string;
    }>;
    state?: unknown[]; // @deprecated Legacy data list, use states instead
    path?: string; // Derived slug for file system paths
}

export type BasicTreeNode<T> = T & {
    children?: BasicTreeNode<T>[] | null;
};

export type frameStructureData<T> = {
    id: string;
    data: T;
    status: 'pre' | 'post';
};

export type TreeNode<T> = BasicTreeNode<frameStructureData<T>>;

export type TreeNodeWithParent<T> = BasicTreeNode<frameStructureData<T> & { parent: TreeNodeWithParent<T> | null }>;

export interface ChildOutput<T, U> {
    node: TreeNode<T>;
    output: U;
}

export type FrameStructNode = TreeNode<FrameData>;
