import fs from 'node:fs';
import prompts from 'prompts';
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite';
import { logger } from './logger';

/**
 * Check if a checkpoint exists for the given thread_id
 */
async function checkpointExists(checkpointer: SqliteSaver, threadId: string): Promise<boolean> {
    try {
        const checkpoints = checkpointer.list({ configurable: { thread_id: threadId } }, { limit: 1 });
        const firstCheckpoint = await checkpoints.next();
        return !firstCheckpoint.done && firstCheckpoint.value !== undefined;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printTestLog(`Error checking checkpoint: ${errorMessage}`);
        return false;
    }
}

/**
 * Prompt user to choose whether to resume from checkpoint or start fresh
 */
async function promptUserChoice(): Promise<'resume' | 'fresh'> {
    logger.printInfoLog('Found existing cache for this project.');

    const response = await prompts({
        type: 'select',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            { title: 'Resume from cache', value: 'resume' },
            { title: 'Start fresh (will clear existing cache)', value: 'fresh' },
        ],
        initial: 0,
    });

    // Handle user cancellation (Ctrl+C)
    if (response.choice === undefined) {
        logger.printWarnLog('Operation cancelled by user.');
        process.exit(0);
    }

    return response.choice as 'resume' | 'fresh';
}

/**
 * Clear checkpoint for the given thread_id
 */
async function clearCheckpoint(checkpointer: SqliteSaver, threadId: string): Promise<void> {
    try {
        // Delete all checkpoints for this thread_id
        await checkpointer.deleteThread(threadId);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printWarnLog(`Failed to clear checkpoint: ${errorMessage}`);
    }
}

/**
 * Check and prompt user for checkpoint decision
 * Returns true if user wants to resume, false if start fresh, undefined if no checkpoint exists
 */
export async function promptCheckpointChoice(checkpointer: SqliteSaver, threadId: string): Promise<boolean | undefined> {
    const hasCheckpoint = await checkpointExists(checkpointer, threadId);

    if (!hasCheckpoint) {
        return undefined;
    }

    const choice = await promptUserChoice();
    return choice === 'resume';
}

/**
 * Clear checkpoint for the given thread_id (exported for external use)
 */
export async function clearThreadCheckpoint(checkpointer: SqliteSaver, threadId: string): Promise<void> {
    await clearCheckpoint(checkpointer, threadId);
}

/**
 * Initialize SqliteSaver with the database path
 */
export function initializeSqliteSaver(dbPath: string): SqliteSaver {
    // Ensure the directory exists
    const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'));
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // SqliteSaver.fromConnString already sets up the database
    const checkpointer = SqliteSaver.fromConnString(dbPath);
    return checkpointer;
}
