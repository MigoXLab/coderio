/**
 * Generic tree traversal utilities for nested dict/list structures.
 */

import type { Dict } from '../../../../types/validation-types';

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
