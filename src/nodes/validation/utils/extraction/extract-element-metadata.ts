/**
 * Element Registry for Validation Subsystem
 *
 * Provides a unified registry that extracts all element metadata from the structure tree
 * in a single traversal. This eliminates redundant tree walks and consolidates element
 * extraction logic that was previously duplicated across multiple files.
 *
 * Core principle: Extract once from FrameData, reuse many times.
 */

import type { FigmaFrameInfo } from '../../../../types/figma-types';
import { getNodeId, traverseTree, type Dict, type ComponentInfo } from '../tree/tree-traversal';

/**
 * Complete metadata for a single element (Figma node) extracted from structure tree.
 */
export interface ElementMetadata {
    id: string;
    name: string; // From figmaNodeMap lookup
    parentComponentId: string;
    parentComponentName: string;
    parentComponentPath: string;
    parentItemType: 'frame' | 'component';
}

/**
 * Unified registry containing all elements and components.
 * Built once at validation start and reused across all iterations.
 */
export interface ElementMetadataRegistry {
    elements: Map<string, ElementMetadata>; // elementId -> full metadata
    components: Map<string, ComponentInfo>; // componentId -> { id, name, path }
}

/**
 * Extract element metadata from protocol structure tree.
 *
 * Traverses the structure tree and builds a unified registry of all elements
 * and components with complete metadata in a single pass.
 *
 * This function combines the logic previously split across:
 * - buildElementToComponentMap() (tree-traversal.ts)
 * - buildStructureRegistry() (capture-position.ts)
 * - collectAllElements() (capture-position.ts)
 *
 * @param structureTree - The component structure tree from Structure node
 * @param figmaNodeMap - Map of Figma node IDs to node data (for element name lookup)
 * @returns ElementMetadataRegistry containing all elements and components with complete metadata
 */
export function extractElementMetadata(structureTree: Dict, figmaNodeMap: Record<string, FigmaFrameInfo>): ElementMetadataRegistry {
    const elements = new Map<string, ElementMetadata>();
    const components = new Map<string, ComponentInfo>();

    traverseTree(structureTree, (node: Dict) => {
        const data = node.data as Dict;
        const componentId = getNodeId(node);
        if (!componentId) return;

        // Extract component metadata from FrameData
        const componentPath = (data?.componentPath as string) || (data?.path as string) || (data?.kebabName as string);
        const componentName = (data?.name as string) || componentId;
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const itemType: 'frame' | 'component' = hasChildren ? 'frame' : 'component';

        // Store component info
        components.set(componentId, { id: componentId, name: componentName, path: componentPath });

        // Extract element IDs from FrameData.elements (populated by Structure node)
        const rawElements = (data as { elements?: unknown }).elements;
        if (!rawElements || !Array.isArray(rawElements)) return;

        for (const el of rawElements) {
            if (!el || typeof el !== 'object') continue;
            const elementId = (el as Dict).id as string;
            if (!elementId) continue;

            // Lookup Figma name (combined with traversal to avoid second pass)
            const figmaNode = figmaNodeMap[elementId];
            const elementName = figmaNode?.name ?? elementId;

            // Store complete element metadata
            elements.set(elementId, {
                id: elementId,
                name: elementName,
                parentComponentId: componentId,
                parentComponentName: componentName,
                parentComponentPath: componentPath,
                parentItemType: itemType,
            });
        }
    });

    return { elements, components };
}

/**
 * Extract component paths from registry.
 *
 * Helper function to maintain compatibility with code expecting Record<componentId, path>.
 * This replaces the expensive buildComponentPathMap() filesystem scan.
 *
 * @param registry - Pre-built element registry
 * @returns Map from component ID to filesystem path
 */
export function extractComponentPaths(registry: ElementMetadataRegistry): Record<string, string> {
    const paths: Record<string, string> = {};
    for (const [id, info] of registry.components) {
        if (info.path) {
            paths[id] = info.path;
        }
    }
    return paths;
}

/**
 * Build element-to-component map from element metadata registry.
 *
 * Helper function to maintain compatibility with code expecting Map<elementId, ComponentInfo>.
 * This replaces the buildElementToComponentMap() traversal.
 *
 * @param registry - Pre-built element registry
 * @returns Map from element ID to parent component info
 */
export function extractMapFromRegistry(registry: ElementMetadataRegistry): Map<string, ComponentInfo> {
    const map = new Map<string, ComponentInfo>();
    for (const [elementId, metadata] of registry.elements) {
        map.set(elementId, {
            id: metadata.parentComponentId,
            name: metadata.parentComponentName,
            path: metadata.parentComponentPath,
        });
    }
    return map;
}
