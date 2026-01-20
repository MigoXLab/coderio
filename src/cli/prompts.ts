import prompts from 'prompts';
import { logger } from '../utils/logger';

async function typedPrompt<U>(config: prompts.PromptObject<string>): Promise<Record<string, U>> {
    return prompts(config, {
        onCancel: () => {
            process.exit(0);
        },
    });
}

type UserChoice = 'resume' | 'fresh';

export async function promptUserChoice(): Promise<UserChoice> {
    const response = await typedPrompt<UserChoice>({
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

    return response.choice;
}
