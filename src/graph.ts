import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphNode } from './types/graph-types';
import { GraphStateAnnotation } from './state';
import { initialProject } from './nodes/initial';
import { generateProtocol } from './nodes/process';
import { parseFigmaUrl } from './utils/url-parser';
import { createDefaultWorkspace } from './utils/workspace';

const graph = new StateGraph(GraphStateAnnotation)
    .addNode(GraphNode.INITIAL, initialProject, { retryPolicy: { maxAttempts: 3 } })
    .addNode(GraphNode.PROCESS, generateProtocol, { retryPolicy: { maxAttempts: 3 } })
    .addEdge(START, GraphNode.INITIAL)
    .addEdge(GraphNode.INITIAL, GraphNode.PROCESS)
    .addEdge(GraphNode.PROCESS, END)
    .compile();

export async function design2code(url: string): Promise<void> {
    const urlInfo = parseFigmaUrl(url);
    const workspace = createDefaultWorkspace(urlInfo.name);

    const initialState = {
        messages: [],
        urlInfo,
        workspace,
    };

    await graph.invoke(initialState);
}
