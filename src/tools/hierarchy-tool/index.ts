/**
 * Component hierarchy lookup tool for judger agent.
 *
 * Provides methods to query the component structure tree for parent-child
 * relationships, siblings, and shared component instances.
 */

import { tools } from 'evoltagent';
import { findInTree, getNodeId } from '../../nodes/validation/utils/tree/tree-traversal';
import type { ComponentPaths, HierarchyNode, ParentInfo } from './types';

/**
 * Component hierarchy lookup tool.
 *
 * This tool allows agents to understand the component tree structure,
 * find parents, siblings, and children, and identify shared component instances.
 */
@tools({
    lookup: {
        description:
            'Get file path, parent, siblings, and children for a component. Use this to find the correct file path before reading component files.',
        params: [{ name: 'componentId', type: 'string', description: 'Component ID to look up' }],
        returns: { type: 'string', description: 'Formatted string with file path, parent (with its file path), siblings, and children' },
        examples: [
            `<HierarchyTool.lookup>
<componentId>HeroSection</componentId>
</HierarchyTool.lookup>`,
        ],
    },
    getSharedInstances: {
        description:
            'Find all component instances using a specific file path. Useful for identifying which components share the same implementation file (e.g., StartButton and ApiButton both using button/index.tsx). ALWAYS check this before editing a shared file.',
        params: [{ name: 'filePath', type: 'string', description: 'Filesystem path to search for (can be relative or absolute)' }],
        returns: { type: 'string', description: 'Formatted string with all component instances using the file' },
        examples: [
            `<HierarchyTool.getSharedInstances>
<filePath>button/index.tsx</filePath>
</HierarchyTool.getSharedInstances>`,
        ],
    },
})
export class HierarchyTool {
    private _structureTree: HierarchyNode = {};
    private _componentPaths: ComponentPaths = {};

    constructor() {
        this._structureTree = {};
        this._componentPaths = {};
    }

    /**
     * Initialize with page structure and path mapping.
     */
    setContext(structureTree: HierarchyNode, componentPaths: ComponentPaths): void {
        this._structureTree = structureTree;
        this._componentPaths = componentPaths;
    }

    lookup(componentId: string): string {
        const node = findInTree(this._structureTree, componentId);
        if (!node) {
            return `Component '${componentId}' not found in structure tree`;
        }

        const parentInfo = this._findParent(this._structureTree, componentId);
        const parentStr = parentInfo ? `Parent: ${parentInfo.id}` : 'Parent: None (root component)';

        // Include parent file path if available (helps agent read parent files without guessing paths)
        const parentPathStr =
            parentInfo && this._componentPaths[parentInfo.id] ? `Parent File: ${this._componentPaths[parentInfo.id]}` : '';

        let siblings: string[] = [];
        if (parentInfo) {
            const parentNode = findInTree(this._structureTree, parentInfo.id);
            if (parentNode) {
                const children = (parentNode.children as HierarchyNode[]) || [];
                siblings = children.map(child => getNodeId(child)).filter((id): id is string => id !== undefined && id !== componentId);
            }
        }
        const siblingsStr = siblings.length > 0 ? `Siblings: ${siblings.join(', ')}` : 'Siblings: None';

        const nodeChildren = (node.children as HierarchyNode[]) || [];
        const children = nodeChildren.map(child => getNodeId(child)).filter((id): id is string => id !== undefined);
        const childrenStr = children.length > 0 ? `Children: ${children.join(', ')}` : 'Children: None';

        // Include file path for this component
        const filePath = this._componentPaths[componentId];
        const fileStr = filePath ? `File: ${filePath}` : '';

        const lines = [`Component: ${componentId}`, fileStr, parentStr, parentPathStr, siblingsStr, childrenStr].filter(Boolean);

        return lines.join('\n');
    }

    getSharedInstances(filePath: string): string {
        const instances: string[] = [];
        for (const [compId, compPath] of Object.entries(this._componentPaths)) {
            if (compPath.includes(filePath) || compPath.endsWith(filePath)) {
                instances.push(compId);
            }
        }

        if (instances.length === 0) {
            return `No components found using file: ${filePath}`;
        }

        const instancesList = instances.map(inst => `  - ${inst}`).join('\n');
        return `Components using ${filePath}:
${instancesList}

Warning: Changes to this file will affect ALL ${instances.length} instance(s)`;
    }

    private _findParent(node: HierarchyNode, targetId: string, parent: HierarchyNode | null = null): ParentInfo | undefined {
        const nodeId = getNodeId(node);
        if (nodeId === targetId) {
            if (parent) {
                const parentId = getNodeId(parent);
                if (parentId) {
                    return { id: parentId };
                }
            }
            return undefined;
        }

        const children = (node.children as HierarchyNode[]) || [];
        for (const child of children) {
            const result = this._findParent(child, targetId, node);
            if (result !== undefined) {
                return result;
            }
        }

        return undefined;
    }
}
