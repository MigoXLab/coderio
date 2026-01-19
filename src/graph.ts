import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphNode } from './types/graph-types';
import { GraphStateAnnotation } from './state';
import { initialProject } from './nodes/initial';
import { generateProtocol } from './nodes/process';
import { parseFigmaUrl } from './utils/url-parser';
import { createDefaultWorkspace } from './utils/workspace';
import { generateCode } from './nodes/code';

const graph = new StateGraph(GraphStateAnnotation)
    .addNode(GraphNode.INITIAL, initialProject)
    .addNode(GraphNode.PROCESS, generateProtocol)
    .addNode(GraphNode.CODE, generateCode)
    .addEdge(START, GraphNode.INITIAL)
    .addEdge(GraphNode.INITIAL, GraphNode.PROCESS)
    .addEdge(GraphNode.PROCESS, GraphNode.CODE)
    .addEdge(GraphNode.CODE, END)
    .compile();

export async function design2code(url: string): Promise<void> {
    const urlInfo = parseFigmaUrl(url);
    const workspace = createDefaultWorkspace(urlInfo.projectName!);

    const initialState = {
        messages: [],
        urlInfo,
        workspace,
    };

    await graph.invoke(initialState);
}
