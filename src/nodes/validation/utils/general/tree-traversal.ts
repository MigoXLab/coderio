/**
 * Generic tree traversal utilities for nested dict/list structures.
 *
 * NOTE: This module lives in `src/nodes/validation/utils/general/` as part of the
 * validation subsystem's shared utilities.
 */

/**
 * Generic dictionary type.
 */
export type Dict = Record<string, unknown>;

/**
 * Get node ID, trying componentId first, then id.
 */
export function getNodeId(node: Dict): string | undefined {
    return (node?.componentId as string) || (node?.id as string) || undefined;
}

/**
 * Generic recursive search through any dict/list structure to find node by ID.
 *
 * This function can search through Figma JSON, structure trees, or any nested data.
 */
export function findInTree(data: unknown, targetId: string, idKeys: string[] = ['id', 'componentId']): Dict | undefined {
    if (data === null || data === undefined) {
        return undefined;
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
        const dict = data as Dict;
        for (const idKey of idKeys) {
            if (dict[idKey] === targetId) {
                return dict;
            }
        }
        for (const value of Object.values(dict)) {
            const result = findInTree(value, targetId, idKeys);
            if (result) {
                return result;
            }
        }
    } else if (Array.isArray(data)) {
        for (const item of data) {
            const result = findInTree(item, targetId, idKeys);
            if (result) {
                return result;
            }
        }
    }

    return undefined;
}

/**
 * Generic tree traversal with callback function.
 */
export function traverseTree(node: Dict, callback: (node: Dict) => void, childrenKey: string = 'children'): void {
    callback(node);
    const children = node[childrenKey] as Dict[] | undefined;
    if (children && Array.isArray(children)) {
        for (const child of children) {
            traverseTree(child, callback, childrenKey);
        }
    }
}

/**
 * Component information extracted from a structure tree.
 */
export interface ComponentInfo {
    id: string;
    name: string;
    path: string;
}
