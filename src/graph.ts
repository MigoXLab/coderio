import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphNode, ValidationMode } from './types/graph-types';
import { GraphStateAnnotation } from './state';
import { initialProject } from './nodes/initial';
import { generateProtocol } from './nodes/process';
import { runValidation } from './nodes/validation';
import { parseFigmaUrl } from './utils/url-parser';
import { workspaceManager } from './utils/workspace';
import { generateCode } from './nodes/code';
import { initializeSqliteSaver, promptCheckpointChoice, clearThreadCheckpoint } from './utils/checkpoint';
import { logger } from './utils/logger';

export async function design2code(url: string, mode?: ValidationMode): Promise<void> {
    const urlInfo = parseFigmaUrl(url);
    const threadId = urlInfo.projectName!;
    const workspace = workspaceManager.initWorkspace(threadId);

    // Initialize SqliteSaver with the database path
    const checkpointer = initializeSqliteSaver(workspace.db);
    const resume = await promptCheckpointChoice(checkpointer, threadId);

    logger.printInfoLog(`Starting design-to-code process for: ${urlInfo.projectName}`);

    // If not resuming, delete workspace and reinitialize checkpointer
    if (resume !== true) {
        // Preserve only the database file to avoid EBUSY error on Windows (SQLite lock)
        workspaceManager.deleteWorkspace(workspace, ['checkpoint/coderio-cli.db']);
        logger.printInfoLog('Starting fresh...');

        // Clear existing checkpoints for this thread instead of deleting the file
        await clearThreadCheckpoint(checkpointer, threadId);
    } else {
        logger.printInfoLog('Resuming from cache...');
    }

    // Compile graph with checkpointer (after potential reinitialization)
    const graph = new StateGraph(GraphStateAnnotation)
        .addNode(GraphNode.INITIAL, initialProject)
        .addNode(GraphNode.PROCESS, generateProtocol)
        .addNode(GraphNode.CODE, generateCode)
        .addNode(GraphNode.VALIDATION, runValidation)
        .addEdge(START, GraphNode.INITIAL)
        .addEdge(GraphNode.INITIAL, GraphNode.PROCESS)
        .addEdge(GraphNode.PROCESS, GraphNode.CODE)
        .addEdge(GraphNode.CODE, GraphNode.VALIDATION)
        .addEdge(GraphNode.VALIDATION, END)
        .compile({ checkpointer });

    const config = { configurable: { thread_id: threadId } };

    // If resuming from checkpoint, pass null to let LangGraph resume from saved state
    // Otherwise, pass initial state to start fresh
    const validationMode: ValidationMode = mode ?? ValidationMode.Full;
    const state =
        resume === true
            ? null
            : {
                  messages: [],
                  urlInfo,
                  workspace,
                  config: {
                      validationMode,
                  },
              };
    await graph.invoke(state, config);

    logger.printSuccessLog('Design-to-code process completed!');
}
