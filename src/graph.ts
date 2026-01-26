import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphNode } from './types/graph-types';
import { GraphStateAnnotation } from './state';
import { initialProject } from './nodes/initial';
import { generateProtocol } from './nodes/process';
import { parseFigmaUrl } from './utils/url-parser';
import { deleteWorkspace, initWorkspace } from './utils/workspace';
import { generateCode } from './nodes/code';
import { initializeSqliteSaver, promptCheckpointChoice } from './utils/checkpoint';
import { logger } from './utils/logger';

export async function design2code(url: string): Promise<void> {
    const urlInfo = parseFigmaUrl(url);
    const threadId = urlInfo.projectName!;
    const workspace = initWorkspace(threadId);

    // Initialize SqliteSaver with the database path
    let checkpointer = initializeSqliteSaver(workspace.db);
    const resume = await promptCheckpointChoice(checkpointer, threadId);

    logger.printInfoLog(`Starting design-to-code process for: ${urlInfo.projectName}`);

    // If not resuming, delete workspace and reinitialize checkpointer
    if (resume !== true) {
        deleteWorkspace(workspace);
        logger.printInfoLog('Starting fresh...');
        // Reinitialize checkpointer after deleting workspace
        checkpointer = initializeSqliteSaver(workspace.db);
    } else {
        logger.printInfoLog('Resuming from cache...');
    }

    // Compile graph with checkpointer (after potential reinitialization)
    const graph = new StateGraph(GraphStateAnnotation)
        .addNode(GraphNode.INITIAL, initialProject)
        .addNode(GraphNode.PROCESS, generateProtocol)
        .addNode(GraphNode.CODE, generateCode)
        .addEdge(START, GraphNode.INITIAL)
        .addEdge(GraphNode.INITIAL, GraphNode.PROCESS)
        .addEdge(GraphNode.PROCESS, GraphNode.CODE)
        .addEdge(GraphNode.CODE, END)
        .compile({ checkpointer });

    const config = { configurable: { thread_id: threadId } };

    // If resuming from checkpoint, pass null to let LangGraph resume from saved state
    // Otherwise, pass initial state to start fresh
    const state =
        resume === true
            ? null
            : {
                  messages: [],
                  urlInfo,
                  workspace,
              };
    await graph.invoke(state, config);

    logger.printSuccessLog('Design-to-code process completed!');
}
