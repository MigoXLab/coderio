/**
 * Figma API Types
 *
 * Type definitions for Figma design data structures.
 * These types represent the data fetched from Figma REST API and used throughout the protocol generation process.
 */

/* URL and File Information */

/**
 * Parsed Figma URL information
 */
export interface FigmaUrlInfo {
    /** The ID of the Figma file */
    fileId: string | null;
    /** The name of the Figma file */
    name: string;
    /** The ID of the Figma node */
    nodeId: string | null;
    /** The name of the project */
    projectName: string | null;
}

/* Color and Visual Properties */

/**
 * RGBA color representation
 */
export interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Gradient stop definition
 */
export interface FigmaGradientStop {
    color: FigmaColor;
    position: number;
}

/**
 * Figma paint/fill object
 * Supports solid colors, gradients, and images
 */
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

/* Position and Layout */

/**
 * Position and size in Figma coordinate space
 */
export interface FigmaPositionAndSize {
    x: number;
    y: number;
    width: number;
    height: number;
}

/* Typography */

/**
 * Text styling properties from Figma
 */
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

/* CSS Conversion */

/**
 * Computed CSS styles converted from Figma properties
 * Used for direct style application in generated components
 */
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

/* Frame/Node Structure */

/**
 * Figma frame/node data structure
 * Represents a complete Figma design node with all its properties and children
 */
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

/**
 * Supported Figma image export formats
 */
export enum FigmaImageFormat {
    PNG = 'png',
    JPG = 'jpg',
    SVG = 'svg',
    PDF = 'pdf',
    EPS = 'eps',
    WEBP = 'webp',
}
