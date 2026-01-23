import type { MisalignedComponent } from '../../types/validation-types';

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

    const padding = figmaMetadata.padding as { left?: number; top?: number; right?: number; bottom?: number } | undefined;
    const layoutMode = typeof figmaMetadata.layoutMode === 'string' ? figmaMetadata.layoutMode : 'NONE';
    const itemSpacing = typeof figmaMetadata.itemSpacing === 'number' ? figmaMetadata.itemSpacing : 0;
    const primaryAxisAlignItems = typeof figmaMetadata.primaryAxisAlignItems === 'string' ? figmaMetadata.primaryAxisAlignItems : 'N/A';
    const counterAxisAlignItems = typeof figmaMetadata.counterAxisAlignItems === 'string' ? figmaMetadata.counterAxisAlignItems : 'N/A';
    // componentPaths should always be provided with absolute filesystem paths
    const resolvedPath = componentPaths?.[component.componentId];
    if (!resolvedPath) {
        throw new Error(`Component ${component.componentId} not found in componentPaths mapping`);
    }

    return `Component ID: ${component.componentId}
Element IDs: ${JSON.stringify(component.elementIds)}
File: ${resolvedPath}

Validation Report:
${validationReportFormatted}

Figma Layout:
- Mode: ${layoutMode}
- Item Spacing: ${itemSpacing}px
- Padding: ${padding?.left ?? 0}px (left) ${padding?.top ?? 0}px (top) ${padding?.right ?? 0}px (right) ${padding?.bottom ?? 0}px (bottom)
- Primary Axis Alignment: ${primaryAxisAlignItems}
- Counter Axis Alignment: ${counterAxisAlignItems}

TASK:
1. Read component file at: ${resolvedPath}
2. Identify the layout error by comparing code with Figma metadata
3. Locate exact code patterns with FileEditor.find
4. Output JSON diagnosis with precise refine_instructions

IMPORTANT:
- Use FileEditor.read("${resolvedPath}") to read the component code
- The path is an absolute filesystem path (e.g., /workspace/src/components/button/index.tsx)
- When using HierarchyTool.lookup or related tools, use the Component ID: ${component.componentId}

Remember: Use exact code strings and line numbers in refine_instructions.
`;
}
