import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphNode } from './types/graph-types';
import { initialProject } from './nodes/initial';
import { RETRY_POLICY } from './constants/node-config';
import { WorkspaceStructure } from './types/workspace-types';
import { GraphStateAnnotation } from './state';

// Graph definition
const graph = new StateGraph(GraphStateAnnotation)
    .addNode(GraphNode.INITIAL, initialProject, RETRY_POLICY)
    .addEdge(START, GraphNode.INITIAL)
    .addEdge(GraphNode.INITIAL, END)
    .compile();

/**
 * Main entry point for converting design (Figma) to code.
 * It executes a state graph that handles project scaffolding, protocol generation, and data mapping.
 *
 * @param workspace - The target workspace structure
 * @throws Error if the graph execution fails
 */
export async function design2code(workspace: WorkspaceStructure): Promise<void> {
    const initialState = {
        messages: [],
        workspace,
    };

    // The error will bubble up to the caller (CLI or Script)
    await graph.invoke(initialState);
}
