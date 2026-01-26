/**
 * Unified Protocol Context Extraction
 *
 * Extracts all validation-relevant data from protocol in a single traversal.
 * Replaces the legacy multi-step extraction pipeline:
 * - extractFigmaTreeFromProtocol
 * - normalizeFigmaCoordinates
 * - FigmaNodeService
 * - extractElementMetadata
 *
 * Core principle: Protocol is the single source of truth. Extract once, use everywhere.
 */

import type { FigmaFrameInfo, FrameStructNode } from '../../../../types/figma-types';
import type {
    ComponentInfo,
    ElementInfo,
    ElementMetadataRegistry,
    FigmaPosition,
    ValidationContext,
} from '../../../../types/validation-types';
import { resolveAppSrc, resolveComponentPath } from '../../../../utils/workspace';
import type { WorkspaceStructure } from '../../../../types/workspace-types';

/**
 * Extract unified validation context from protocol.
 *
 * Single traversal builds all needed maps:
 * - Component info (id, name, path)
 * - Element metadata with normalized positions
 * - Figma positions with offset applied
 *
 * @param protocol - Protocol structure tree (FrameStructNode)
 * @returns ValidationContext containing all data needed for validation
 */
export function extractValidationContext(protocol: FrameStructNode): ValidationContext {
    // Extract offset from root bounding box
    const offset = extractOffset(protocol);

    const elements = new Map<string, ElementInfo>();
    const components = new Map<string, ComponentInfo>();
    const elementToComponent = new Map<string, ComponentInfo>();
    const figmaPositions: Record<string, FigmaPosition | undefined> = {};

    // Single traversal of protocol tree
    traverseProtocol(protocol, node => {
        const componentInfo: ComponentInfo = {
            id: node.id,
            name: node.data.name,
            path: node.data.componentPath ?? node.data.path ?? node.data.kebabName ?? node.id,
        };
        components.set(node.id, componentInfo);

        // Determine item type based on children
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const itemType: 'frame' | 'component' = hasChildren ? 'frame' : 'component';

        // Extract elements from this component
        if (node.data.elements && Array.isArray(node.data.elements)) {
            extractElementsRecursive(
                node.data.elements as FigmaFrameInfo[],
                componentInfo,
                itemType,
                elements,
                elementToComponent,
                figmaPositions,
                offset
            );
        }
    });

    return { offset, elements, components, elementToComponent, figmaPositions };
}

/**
 * Extract coordinate offset from protocol root.
 */
function extractOffset(protocol: FrameStructNode): { x: number; y: number } {
    // First try: protocol.data.layout.boundingBox (pre-computed CSS coordinates)
    if (protocol.data.layout?.boundingBox) {
        return {
            x: protocol.data.layout.boundingBox.left,
            y: protocol.data.layout.boundingBox.top,
        };
    }

    // Second try: first element's absoluteBoundingBox (Figma coordinates)
    const firstElement = protocol.data.elements?.[0] as FigmaFrameInfo | undefined;
    if (firstElement?.absoluteBoundingBox) {
        return {
            x: firstElement.absoluteBoundingBox.x,
            y: firstElement.absoluteBoundingBox.y,
        };
    }

    // Default: no offset
    return { x: 0, y: 0 };
}

/**
 * Traverse protocol structure tree and invoke callback for each node.
 */
function traverseProtocol(node: FrameStructNode, callback: (node: FrameStructNode) => void): void {
    callback(node);
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            traverseProtocol(child, callback);
        }
    }
}

/**
 * Recursively extract elements from Figma node tree.
 * Applies offset to positions and builds element metadata.
 */
function extractElementsRecursive(
    elements: FigmaFrameInfo[],
    componentInfo: ComponentInfo,
    itemType: 'frame' | 'component',
    elementsMap: Map<string, ElementInfo>,
    elementToComponent: Map<string, ComponentInfo>,
    figmaPositions: Record<string, FigmaPosition | undefined>,
    offset: { x: number; y: number }
): void {
    for (const element of elements) {
        if (!element || !element.id) continue;

        const bbox = element.absoluteBoundingBox;
        const position: FigmaPosition = bbox
            ? {
                  x: bbox.x - offset.x,
                  y: bbox.y - offset.y,
                  w: bbox.width,
                  h: bbox.height,
              }
            : { x: 0, y: 0, w: 0, h: 0 };

        // Store normalized Figma position
        figmaPositions[element.id] = position;

        // Store element metadata
        elementsMap.set(element.id, {
            id: element.id,
            name: element.name,
            type: element.type,
            position,
            layoutMode: element.layoutMode,
            primaryAxisAlignItems: element.primaryAxisAlignItems,
            counterAxisAlignItems: element.counterAxisAlignItems,
            itemSpacing: element.itemSpacing,
            paddingTop: element.paddingTop,
            paddingRight: element.paddingRight,
            paddingBottom: element.paddingBottom,
            paddingLeft: element.paddingLeft,
            constraints: element.constraints as Record<string, unknown> | undefined,
            parentComponentId: componentInfo.id,
            parentComponentName: componentInfo.name,
            parentComponentPath: componentInfo.path,
            parentItemType: itemType,
        });

        // Store element-to-component mapping
        elementToComponent.set(element.id, componentInfo);

        // Recurse into children and frames
        if (element.children && Array.isArray(element.children)) {
            extractElementsRecursive(element.children, componentInfo, itemType, elementsMap, elementToComponent, figmaPositions, offset);
        }
        if (element.frames && Array.isArray(element.frames)) {
            extractElementsRecursive(element.frames, componentInfo, itemType, elementsMap, elementToComponent, figmaPositions, offset);
        }
    }
}

// ============================================================================
// Compatibility Helpers
// ============================================================================

/**
 * Extract component paths from context and resolve to absolute filesystem paths.
 *
 * Transforms protocol alias paths (@/components/Button) to absolute paths
 * (/Users/.../my-app/src/components/Button/index.tsx)
 *
 * @param context - Validation context with component info
 * @param workspace - Workspace structure for path resolution
 * @returns Map of component IDs to absolute filesystem paths
 */
export function extractComponentPaths(context: ValidationContext, workspace: WorkspaceStructure): Record<string, string> {
    const paths: Record<string, string> = {};
    for (const [id, info] of context.components) {
        if (info.path) {
            paths[id] = resolveAppSrc(workspace, resolveComponentPath(info.path));
        }
    }
    return paths;
}

/**
 * Convert ValidationContext to ElementMetadataRegistry for compatibility.
 */
export function toElementMetadataRegistry(context: ValidationContext): ElementMetadataRegistry {
    const elements = new Map<
        string,
        {
            id: string;
            name: string;
            parentComponentId: string;
            parentComponentName: string;
            parentComponentPath: string;
            parentItemType: 'frame' | 'component';
        }
    >();

    for (const [id, element] of context.elements) {
        elements.set(id, {
            id: element.id,
            name: element.name,
            parentComponentId: element.parentComponentId,
            parentComponentName: element.parentComponentName,
            parentComponentPath: element.parentComponentPath,
            parentItemType: element.parentItemType,
        });
    }

    return { elements, components: context.components };
}
