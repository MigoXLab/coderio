/**
 * Run multiple asynchronous tasks with a concurrency limit.
 *
 * @param items - Array of items to process
 * @param taskGenerator - Function that creates a promise for a single item
 * @param concurrency - Maximum number of concurrent tasks
 * @returns Array of results
 */
export async function promisePool<T, R>(items: T[], taskGenerator: (item: T) => Promise<R>, concurrency: number = 5): Promise<R[]> {
    const results: R[] = [];
    let nextIndex = 0;
    const executing = new Set<Promise<void>>();

    const processTask = async (index: number) => {
        const item = items[index];
        const result = await taskGenerator(item as T);
        results[index] = result;
    };

    while (nextIndex < items.length || executing.size > 0) {
        while (nextIndex < items.length && executing.size < concurrency) {
            const index = nextIndex++;
            const promise = processTask(index).finally(() => {
                executing.delete(promise);
            });
            executing.add(promise);
        }

        if (executing.size > 0) {
            await Promise.race(executing);
        }
    }

    return results;
}
