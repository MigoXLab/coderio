/**
 * Component hierarchy lookup tool for judger agent.
 *
 * Provides methods to query the component structure tree for parent-child
 * relationships, siblings, and shared component instances.
 */

import { tools } from 'evoltagent';
import { findInTree, getNodeId } from '../../nodes/validation/utils/general/tree-traversal';
import type { ComponentPaths, HierarchyNode, ParentInfo } from './types';

/**
 * Component hierarchy lookup tool.
 *
 * This tool allows agents to understand the component tree structure,
 * find parents, siblings, and children, and identify shared component instances.
 */
@tools({
    lookup: {
        description: 'Get parent, siblings, and children for a component',
        params: [{ name: 'componentId', type: 'string', description: 'Component ID to look up' }],
        returns: { type: 'string', description: 'Formatted string with parent, siblings, and children information' },
        examples: [
            `<HierarchyTool.lookup>
<componentId>HeroSection</componentId>
</HierarchyTool.lookup>`,
        ],
    },
    getSiblings: {
        description: 'Get components sharing the same parent',
        params: [{ name: 'componentId', type: 'string', description: 'Component ID to find siblings for' }],
        returns: { type: 'string', description: 'Formatted string with sibling component information' },
        examples: [
            `<HierarchyTool.getSiblings>
<componentId>HeroSection</componentId>
</HierarchyTool.getSiblings>`,
        ],
    },
    getSharedInstances: {
        description:
            'Find all component instances using a specific file path. Useful for identifying which components share the same implementation file (e.g., StartButton and ApiButton both using button/index.tsx)',
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

    lookup(componentId: string): Promise<string> {
        const node = findInTree(this._structureTree, componentId);
        if (!node) {
            return Promise.resolve(`Component '${componentId}' not found in structure tree`);
        }

        const parentInfo = this._findParent(this._structureTree, componentId);
        const parentStr = parentInfo ? `Parent: ${parentInfo.id}` : 'Parent: None (root component)';

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

        return Promise.resolve(`Component: ${componentId}
${parentStr}
${siblingsStr}
${childrenStr}`);
    }

    getSiblings(componentId: string): Promise<string> {
        const parentInfo = this._findParent(this._structureTree, componentId);
        if (!parentInfo) {
            return Promise.resolve(`Component '${componentId}' has no parent (root component)`);
        }

        const parentNode = findInTree(this._structureTree, parentInfo.id);
        if (!parentNode) {
            return Promise.resolve(`Parent node not found for component '${componentId}'`);
        }

        const siblings: string[] = [];
        const children = (parentNode.children as HierarchyNode[]) || [];
        for (const child of children) {
            const childId = getNodeId(child);
            if (childId && childId !== componentId) {
                siblings.push(childId);
            }
        }

        if (siblings.length === 0) {
            return Promise.resolve(`Component '${componentId}' has no siblings`);
        }

        const siblingsList = siblings.map(sib => `  - ${sib}`).join('\n');
        return Promise.resolve(`Siblings of ${componentId}:\n${siblingsList}`);
    }

    getSharedInstances(filePath: string): Promise<string> {
        const instances: string[] = [];
        for (const [compId, compPath] of Object.entries(this._componentPaths)) {
            if (compPath.includes(filePath) || compPath.endsWith(filePath)) {
                instances.push(compId);
            }
        }

        if (instances.length === 0) {
            return Promise.resolve(`No components found using file: ${filePath}`);
        }

        const instancesList = instances.map(inst => `  - ${inst}`).join('\n');
        return Promise.resolve(`Components using ${filePath}:
${instancesList}

Warning: Changes to this file will affect ALL ${instances.length} instance(s)`);
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
