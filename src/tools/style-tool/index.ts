import { tools } from 'evoltagent';
import { CSSStyles, FigmaFrameInfo } from '../../types/figma-types';
import { convertBorderRadius, convertEffects, convertFills, convertStrokes, convertClipContent } from './utils';

@tools({
    convert: {
        description: 'Convert Figma properties to CSS styles, remove redundant properties, and return the processed Figma node',
        params: [{ name: 'node', type: 'FigmaFrameInfo', description: 'Figma node' }],
        returns: {
            type: 'CSSStyles',
            description: 'CSS styles converted from Figma properties',
        },
    },
})
class StyleTool {
    convert(node: FigmaFrameInfo): FigmaFrameInfo {
        const inlineStyles: CSSStyles = {};

        if (node.type !== 'TEXT') {
            convertBorderRadius(node, inlineStyles);
            convertEffects(node, inlineStyles);
            convertFills(node, inlineStyles);
            convertStrokes(node, inlineStyles);
            convertClipContent(node, inlineStyles);
        }

        // Create processed node with styles
        const processedNode: FigmaFrameInfo = {
            ...node,
            inlineStyles,
        };

        // Remove converted fields to reduce data size
        if (node.type !== 'TEXT') {
            const nodeWithOptionalStyles = processedNode as Partial<FigmaFrameInfo> & Record<string, unknown>;
            delete nodeWithOptionalStyles.fills;
            delete nodeWithOptionalStyles.background;
            delete nodeWithOptionalStyles.strokes;
            delete nodeWithOptionalStyles.strokeAlign;
            delete nodeWithOptionalStyles.backgroundColor;
            delete nodeWithOptionalStyles.cornerRadius;
            delete nodeWithOptionalStyles.rectangleCornerRadii;
            delete nodeWithOptionalStyles.effects;
            // delete nodeWithOptionalStyles.absoluteRenderBounds;
            delete nodeWithOptionalStyles.style;
        }
        return processedNode;
    }
}

export const styleTool = new StyleTool();
