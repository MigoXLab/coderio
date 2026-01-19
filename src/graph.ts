import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphNode } from './types/graph-types';
import { GraphStateAnnotation } from './state';
import { initialProject } from './nodes/initial';
import { generateProtocol } from './nodes/process';
import { parseFigmaUrl } from './utils/url-parser';
import { createDefaultWorkspace } from './utils/workspace';
import { generateCode } from './nodes/code';

const DEFAULT_RETRY_POLICY = { retryPolicy: { maxAttempts: 3 } };

const graph = new StateGraph(GraphStateAnnotation)
    .addNode(GraphNode.INITIAL, initialProject, DEFAULT_RETRY_POLICY)
    .addNode(GraphNode.PROCESS, generateProtocol, DEFAULT_RETRY_POLICY)
    .addNode(GraphNode.CODE, generateCode, DEFAULT_RETRY_POLICY)
    .addEdge(START, GraphNode.INITIAL)
    .addEdge(GraphNode.INITIAL, GraphNode.PROCESS)
    .addEdge(GraphNode.PROCESS, GraphNode.CODE)
    .addEdge(GraphNode.CODE, END)
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
