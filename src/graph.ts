import { StateGraph, START, END, type LangGraphRunnableConfig } from '@langchain/langgraph';
import { GraphNode } from './types/graph-types';
import { GraphStateAnnotation } from './state';
import { initialProject } from './nodes/initial';
import { generateProtocol } from './nodes/process';
import { runValidation } from './nodes/validation';
import { parseFigmaUrl } from './utils/url-parser';
import { deleteWorkspace, initWorkspace } from './utils/workspace';
import { generateCode } from './nodes/code';
import { initializeSqliteSaver, promptCheckpointChoice } from './utils/checkpoint';
import { logger } from './utils/logger';

type GraphNodeAction = (
    state: typeof GraphStateAnnotation.State,
    config: LangGraphRunnableConfig
) => Promise<typeof GraphStateAnnotation.Update> | typeof GraphStateAnnotation.Update;

export async function design2code(url: string): Promise<void> {
    const urlInfo = parseFigmaUrl(url);
    const workspace = initWorkspace(urlInfo.projectName!);

    // Initialize SqliteSaver with the database path
    const checkpointer = initializeSqliteSaver(workspace.db);
    // Configure thread_id
    const threadId = urlInfo.projectName!;
    // Check if checkpoint exists and prompt user
    const resume = await promptCheckpointChoice(checkpointer, threadId);
    // Compile graph with checkpointer
    const graph = new StateGraph(GraphStateAnnotation)
        .addNode(GraphNode.INITIAL, initialProject)
        .addNode(GraphNode.PROCESS, generateProtocol)
        .addNode(GraphNode.CODE, generateCode)
        .addNode(GraphNode.VALIDATION, runValidation as unknown as GraphNodeAction)
        .addEdge(START, GraphNode.INITIAL)
        .addEdge(GraphNode.INITIAL, GraphNode.PROCESS)
        .addEdge(GraphNode.PROCESS, GraphNode.CODE)
        .addEdge(GraphNode.CODE, GraphNode.VALIDATION)
        .addEdge(GraphNode.VALIDATION, END)
        .compile({ checkpointer });

    const config = { configurable: { thread_id: threadId } };

    logger.printInfoLog(`Starting design-to-code process for: ${urlInfo.projectName}`);

    // If resuming from checkpoint, pass null to let LangGraph resume from saved state
    // Otherwise, pass initial state to start fresh
    if (resume === true) {
        logger.printInfoLog('Resuming from cache...');
        // Resume from checkpoint - pass null (no new input) to continue from saved state
        // LangGraph will automatically load the last checkpoint for this thread_id
        await graph.invoke(null, config);
    } else {
        deleteWorkspace(workspace);
        logger.printInfoLog('Starting fresh...');
        // Start fresh with initial state
        const initialState = {
            messages: [],
            urlInfo,
            workspace,
        };
        await graph.invoke(initialState, config);
    }

    logger.printSuccessLog('Design-to-code process completed!');
}
