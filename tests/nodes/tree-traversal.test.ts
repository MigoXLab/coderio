import { describe, it, expect } from 'vitest';
import { getNodeId, findInTree } from '../../src/nodes/validation/utils/tree/tree-traversal';
import { Dict } from '../../src/types/validation-types';

describe('tree traversal utilities', () => {
    describe('getNodeId', () => {
        it('should return componentId if available', () => {
            const node: Dict = {
                componentId: 'comp-123',
                id: 'id-456',
            };

            expect(getNodeId(node)).toBe('comp-123');
        });

        it('should return id if componentId is not available', () => {
            const node: Dict = {
                id: 'id-456',
            };

            expect(getNodeId(node)).toBe('id-456');
        });

        it('should return undefined if neither componentId nor id is available', () => {
            const node: Dict = {
                name: 'some-node',
            };

            expect(getNodeId(node)).toBeUndefined();
        });

        it('should prefer componentId even when both are present', () => {
            const node: Dict = {
                componentId: 'comp-123',
                id: 'id-456',
                name: 'test',
            };

            expect(getNodeId(node)).toBe('comp-123');
        });

        it('should handle null or undefined node', () => {
            expect(getNodeId(null as any)).toBeUndefined();
            expect(getNodeId(undefined as any)).toBeUndefined();
        });

        it('should handle empty object', () => {
            expect(getNodeId({})).toBeUndefined();
        });
    });

    describe('findInTree', () => {
        it('should find node by id in flat object', () => {
            const data: Dict = {
                id: 'target-123',
                name: 'test',
            };

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(data);
        });

        it('should find node by componentId in flat object', () => {
            const data: Dict = {
                componentId: 'target-123',
                name: 'test',
            };

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(data);
        });

        it('should find node in nested object', () => {
            const targetNode: Dict = {
                id: 'target-123',
                name: 'target',
            };

            const data: Dict = {
                id: 'root',
                children: {
                    child1: {
                        id: 'child-1',
                        nested: targetNode,
                    },
                },
            };

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(targetNode);
        });

        it('should find node in array', () => {
            const targetNode: Dict = {
                id: 'target-123',
                name: 'target',
            };

            const data = [{ id: 'item-1', name: 'first' }, { id: 'item-2', name: 'second' }, targetNode];

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(targetNode);
        });

        it('should find node in deeply nested structure', () => {
            const targetNode: Dict = {
                id: 'target-123',
                name: 'target',
            };

            const data: Dict = {
                id: 'root',
                level1: {
                    level2: {
                        level3: {
                            level4: [
                                { id: 'item-1' },
                                {
                                    id: 'item-2',
                                    nested: targetNode,
                                },
                            ],
                        },
                    },
                },
            };

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(targetNode);
        });

        it('should return undefined when node is not found', () => {
            const data: Dict = {
                id: 'root',
                children: [{ id: 'child-1' }, { id: 'child-2' }],
            };

            const result = findInTree(data, 'non-existent');

            expect(result).toBeUndefined();
        });

        it('should handle null or undefined data', () => {
            expect(findInTree(null, 'target-123')).toBeUndefined();
            expect(findInTree(undefined, 'target-123')).toBeUndefined();
        });

        it('should handle empty object', () => {
            const result = findInTree({}, 'target-123');

            expect(result).toBeUndefined();
        });

        it('should handle empty array', () => {
            const result = findInTree([], 'target-123');

            expect(result).toBeUndefined();
        });

        it('should use custom idKeys parameter', () => {
            const data: Dict = {
                customId: 'target-123',
                name: 'test',
            };

            const result = findInTree(data, 'target-123', ['customId']);

            expect(result).toEqual(data);
        });

        it('should check multiple idKeys in order', () => {
            const data: Dict = {
                primaryId: 'target-123',
                secondaryId: 'other-id',
                name: 'test',
            };

            const result = findInTree(data, 'target-123', ['primaryId', 'secondaryId']);

            expect(result).toEqual(data);
        });

        it('should handle complex Figma-like structure', () => {
            const targetComponent: Dict = {
                componentId: 'comp-123',
                id: 'node-456',
                name: 'Button',
                type: 'COMPONENT',
            };

            const figmaData: Dict = {
                document: {
                    id: 'doc-1',
                    children: [
                        {
                            id: 'page-1',
                            name: 'Page 1',
                            children: [
                                {
                                    id: 'frame-1',
                                    name: 'Frame',
                                    children: [targetComponent],
                                },
                            ],
                        },
                    ],
                },
            };

            const result = findInTree(figmaData, 'comp-123');

            expect(result).toEqual(targetComponent);
        });

        it('should return first match when multiple nodes have same id', () => {
            const firstMatch: Dict = {
                id: 'target-123',
                name: 'first',
            };

            const data: Dict = {
                id: 'root',
                branch1: firstMatch,
                branch2: {
                    id: 'target-123',
                    name: 'second',
                },
            };

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(firstMatch);
        });

        it('should handle mixed array and object nesting', () => {
            const targetNode: Dict = {
                id: 'target-123',
                name: 'target',
            };

            const data = {
                id: 'root',
                children: [
                    {
                        id: 'child-1',
                        nested: {
                            items: [{ id: 'item-1' }, targetNode],
                        },
                    },
                ],
            };

            const result = findInTree(data, 'target-123');

            expect(result).toEqual(targetNode);
        });

        it('should handle primitive values in tree', () => {
            const data = {
                id: 'root',
                name: 'test',
                count: 42,
                active: true,
                children: [{ id: 'target-123', name: 'target' }],
            };

            const result = findInTree(data, 'target-123');

            expect(result).toBeDefined();
            expect(result?.id).toBe('target-123');
        });
    });
});
