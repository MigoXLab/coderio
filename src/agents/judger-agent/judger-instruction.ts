import type { MisalignedComponent } from '../../nodes/validation/types';

/**
 * Format judger instruction with component info and Figma metadata
 */
export function formatJudgerInstruction(
    component: MisalignedComponent,
    figmaMetadata: Record<string, unknown>,
    componentPaths?: Record<string, string>
): string {
    const vr = component.validationReport;
    const validationReportFormatted = `Current Position: (${vr.currentPosition[0].toFixed(1)}, ${vr.currentPosition[1].toFixed(1)}) px
Target Position: (${vr.targetPosition[0].toFixed(1)}, ${vr.targetPosition[1].toFixed(1)}) px
Absolute Error: (${vr.absoluteError[0].toFixed(1)}, ${vr.absoluteError[1].toFixed(1)}) px`;

    const padding = figmaMetadata.padding as
        | { left?: number; top?: number; right?: number; bottom?: number }
        | undefined;
    const resolvedPath = componentPaths?.[component.componentId] || component.path;

    return `Component ID: ${component.componentId}
Element IDs: ${JSON.stringify(component.elementIds)}
File: ${resolvedPath}

Validation Report:
${validationReportFormatted}

Figma Layout:
- Mode: ${String(figmaMetadata.layoutMode ?? 'NONE')}
- Item Spacing: ${String(figmaMetadata.itemSpacing ?? 0)}px
- Padding: ${padding?.left ?? 0}px (left) ${padding?.top ?? 0}px (top) ${padding?.right ?? 0}px (right) ${padding?.bottom ?? 0}px (bottom)
- Primary Axis Alignment: ${String(figmaMetadata.primaryAxisAlignItems ?? 'N/A')}
- Counter Axis Alignment: ${String(figmaMetadata.counterAxisAlignItems ?? 'N/A')}

TASK:
1. Read component file at: ${resolvedPath}
2. Identify the layout error by comparing code with Figma metadata
3. Locate exact code patterns with FileEditor.find
4. Output JSON diagnosis with precise refine_instructions

IMPORTANT:
- Use FileEditor.read("${resolvedPath}") to read the component code
- The path is already absolute and points to the actual file location
- When using HierarchyTool.lookup or related tools, use the Component ID: ${component.componentId}

Remember: Use exact code strings and line numbers in refine_instructions.
`;
}

