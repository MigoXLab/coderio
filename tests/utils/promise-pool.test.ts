import { describe, it, expect, vi } from 'vitest';
import { promisePool } from '../../src/utils/promise-pool';

describe('promisePool', () => {
    it('should process all items successfully', async () => {
        const items = [1, 2, 3, 4, 5];
        const taskGenerator = async (item: number) => item * 2;

        const results = await promisePool(items, taskGenerator, 2);

        expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it('should respect concurrency limit', async () => {
        const items = [1, 2, 3, 4, 5];
        let currentConcurrency = 0;
        let maxConcurrency = 0;

        const taskGenerator = async (item: number) => {
            currentConcurrency++;
            maxConcurrency = Math.max(maxConcurrency, currentConcurrency);

            await new Promise(resolve => setTimeout(resolve, 10));

            currentConcurrency--;
            return item * 2;
        };

        await promisePool(items, taskGenerator, 2);

        expect(maxConcurrency).toBe(2);
    });

    it('should handle empty array', async () => {
        const items: number[] = [];
        const taskGenerator = async (item: number) => item * 2;

        const results = await promisePool(items, taskGenerator, 2);

        expect(results).toEqual([]);
    });

    it('should handle null or undefined items array', async () => {
        const taskGenerator = async (item: number) => item * 2;

        const results1 = await promisePool(null as any, taskGenerator, 2);
        const results2 = await promisePool(undefined as any, taskGenerator, 2);

        expect(results1).toEqual([]);
        expect(results2).toEqual([]);
    });

    it('should maintain order of results', async () => {
        const items = [1, 2, 3, 4, 5];
        const taskGenerator = async (item: number) => {
            // Simulate different processing times
            await new Promise(resolve => setTimeout(resolve, (5 - item) * 10));
            return item * 2;
        };

        const results = await promisePool(items, taskGenerator, 3);

        expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it('should handle errors in task execution', async () => {
        const items = [1, 2, 3, 4, 5];
        const taskGenerator = async (item: number) => {
            if (item === 3) {
                throw new Error('Task failed');
            }
            return item * 2;
        };

        await expect(promisePool(items, taskGenerator, 2)).rejects.toThrow('Task failed');
    });

    it('should work with default concurrency', async () => {
        const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const taskGenerator = async (item: number) => item * 2;

        const results = await promisePool(items, taskGenerator);

        expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });

    it('should handle concurrency of 1', async () => {
        const items = [1, 2, 3];
        const executionOrder: number[] = [];

        const taskGenerator = async (item: number) => {
            executionOrder.push(item);
            await new Promise(resolve => setTimeout(resolve, 5));
            return item * 2;
        };

        const results = await promisePool(items, taskGenerator, 1);

        expect(results).toEqual([2, 4, 6]);
        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should handle concurrency greater than items length', async () => {
        const items = [1, 2, 3];
        const taskGenerator = async (item: number) => item * 2;

        const results = await promisePool(items, taskGenerator, 10);

        expect(results).toEqual([2, 4, 6]);
    });

    it('should handle async tasks that return different types', async () => {
        const items = ['a', 'b', 'c'];
        const taskGenerator = async (item: string) => ({ value: item, length: item.length });

        const results = await promisePool(items, taskGenerator, 2);

        expect(results).toEqual([
            { value: 'a', length: 1 },
            { value: 'b', length: 1 },
            { value: 'c', length: 1 },
        ]);
    });

    it('should handle tasks with varying completion times', async () => {
        const items = [100, 50, 25, 10, 5];
        const taskGenerator = async (item: number) => {
            await new Promise(resolve => setTimeout(resolve, item));
            return item;
        };

        const results = await promisePool(items, taskGenerator, 3);

        expect(results).toEqual([100, 50, 25, 10, 5]);
    });

    it('should handle promises that resolve immediately', async () => {
        const items = [1, 2, 3, 4, 5];
        const taskGenerator = async (item: number) => item * 2;

        const results = await promisePool(items, taskGenerator, 2);

        expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it('should call task generator for each item', async () => {
        const items = [1, 2, 3];
        const taskGenerator = vi.fn(async (item: number) => item * 2);

        await promisePool(items, taskGenerator, 2);

        expect(taskGenerator).toHaveBeenCalledTimes(3);
        expect(taskGenerator).toHaveBeenCalledWith(1);
        expect(taskGenerator).toHaveBeenCalledWith(2);
        expect(taskGenerator).toHaveBeenCalledWith(3);
    });

    it('should handle large arrays efficiently', async () => {
        const items = Array.from({ length: 100 }, (_, i) => i + 1); // Start from 1 to avoid 0 edge case
        const taskGenerator = async (item: number) => item * 2;

        const results = await promisePool(items, taskGenerator, 10);

        expect(results.length).toBe(100);
        expect(results[0]).toBe(2); // First item is 1 * 2
        expect(results[99]).toBe(200); // Last item is 100 * 2
    });
});
