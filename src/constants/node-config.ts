import type { RetryPolicy } from '@langchain/langgraph';

// Retry policy for the nodes.
// @see https://langchain-ai.github.io/langgraphjs/api/classes/StateGraph.html#addnode
export const RETRY_POLICY = {
    retryPolicy: {
        maxAttempts: 3,
    },
} as { retryPolicy: RetryPolicy };
