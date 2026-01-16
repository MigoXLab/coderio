import { CSSStyles, FigmaColorObject, FigmaFrameInfo } from '../../types/figma-types';
import { ColorConverter } from './color';

// Convert border radius
export const convertBorderRadius = (node: FigmaFrameInfo, inlineStyles: CSSStyles): void => {
    if (node.cornerRadius !== undefined) {
        inlineStyles.borderRadius = `${node.cornerRadius}px`;
    }

    // Individual corner radius
    if (node.rectangleCornerRadii) {
        const [tl, tr, br, bl] = node.rectangleCornerRadii;
        inlineStyles.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
    }
};

// Convert effects (shadow, filter，backdrop-filter)
export const convertEffects = (node: FigmaFrameInfo, inlineStyles: CSSStyles): void => {
    const effects = node.effects;

    if (!effects || effects.length === 0) return;

    const shadows: string[] = [];
    const filters: string[] = [];
    const backdropFilters: string[] = [];

    for (const effect of effects) {
        if (effect.visible === false) continue;

        if (effect.type === 'DROP_SHADOW') {
            const x = effect.offset?.x || 0;
            const y = effect.offset?.y || 0;
            const blur = effect.radius || 0;
            const spread = effect.spread || 0;
            // Use ColorConverter for shadow color
            const color = effect.color ? ColorConverter.convert({ type: 'SOLID', color: effect.color }) : 'rgba(0, 0, 0, 0.25)';

            shadows.push(`${x.toFixed(0)}px ${y.toFixed(0)}px ${(blur / 2).toFixed(0)}px ${spread.toFixed(0)}px ${color}`);
        } else if (effect.type === 'INNER_SHADOW') {
            const x = effect.offset?.x || 0;
            const y = effect.offset?.y || 0;
            const blur = effect.radius || 0;
            const spread = effect.spread || 0;
            const color = effect.color ? ColorConverter.convert({ type: 'SOLID', color: effect.color }) : 'rgba(0, 0, 0, 0.25)';

            shadows.push(`inset ${x.toFixed(0)}px ${y.toFixed(0)}px ${(blur / 2).toFixed(0)}px ${spread.toFixed(0)}px ${color}`);
        } else if (effect.type === 'LAYER_BLUR') {
            const blur = effect.radius || 0;
            filters.push(`blur(${(blur / 2).toFixed(0)}px)`);
        } else if (effect.type === 'BACKGROUND_BLUR') {
            const blur = effect.radius || 0;
            backdropFilters.push(`blur(${(blur / 2).toFixed(0)}px)`);
        }
    }

    if (shadows.length > 0) {
        inlineStyles.boxShadow = shadows.join(', ');
    }

    if (filters.length > 0) {
        inlineStyles.filter = filters.join(' ');
    }

    if (backdropFilters.length > 0) {
        inlineStyles.backdropFilter = backdropFilters.join(', ');
    }
};

// Convert fills to background
// Handles multiple fills and creates layered backgrounds
export const convertFills = (node: FigmaFrameInfo, inlineStyles: CSSStyles): void => {
    const fills = node.fills || node.background;

    if (!fills || fills.length === 0) return;

    // Filter visible fills
    const visibleFills = fills.filter((fill: FigmaColorObject) => fill.visible !== false);
    if (visibleFills.length === 0) return;

    // Convert all fills to CSS
    // For multiple fills, convert SOLID to gradient format for proper layering
    const backgrounds: string[] = visibleFills.map((fill: FigmaColorObject) => {
        if (fill.type === 'SOLID' && visibleFills.length > 1) {
            return ColorConverter.solidToGradient(fill);
        }
        return ColorConverter.convert(fill);
    });

    // IMPORTANT: Reverse the array!
    // Figma fills: index 0 = top layer
    // CSS background: first declared = top layer
    // But Figma's rendering order is bottom-to-top in the fills array
    // So we need to reverse to match CSS rendering order
    backgrounds.reverse();

    // Set background with all layers
    inlineStyles.background = backgrounds.join(', ');
};

// Convert strokes to border
export const convertStrokes = (node: FigmaFrameInfo, inlineStyles: CSSStyles): void => {
    const strokes = node.strokes;

    if (!strokes || strokes.length === 0 || !node.strokeWeight) return;

    const visibleStrokes = strokes.filter((s: FigmaColorObject) => s.visible !== false);
    if (visibleStrokes.length === 0) return;

    const width = node.strokeWeight || 1;
    let strokeColor = '';
    const isGradientStroke = visibleStrokes.some((s: FigmaColorObject) => s.type.includes('GRADIENT'));
    if (isGradientStroke) {
        const gradient = visibleStrokes.find((s: FigmaColorObject) => s.type.includes('GRADIENT'));
        if (gradient) {
            strokeColor = ColorConverter.convert(gradient);
        }
        inlineStyles.strokeColor = strokeColor;
        inlineStyles.borderRadius = `${node.cornerRadius !== undefined ? node.cornerRadius.toFixed(0) : '0'}px`;
        inlineStyles.strokeWidth = `${width}px`;
    } else {
        const solid = visibleStrokes.find((s: FigmaColorObject) => s.type === 'SOLID');
        if (solid) {
            strokeColor = ColorConverter.convert(solid);
        }
        inlineStyles.border = `${width}px solid ${strokeColor}`;
    }
};

// Convert clip content
export const convertClipContent = (node: FigmaFrameInfo, inlineStyles: CSSStyles): void => {
    if (node.clipsContent) {
        inlineStyles.overflow = 'hidden';
    }
};
