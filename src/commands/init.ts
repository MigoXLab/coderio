import { Command } from 'commander';
import { logger } from '../tools/logger.js';

export function createInitCommand() {
    return new Command('init')
        .description('Initialize a new project')
        .option('-n, --name <name>', 'Project name')
        .option('-f, --force', 'Force initialization (overwrite existing files)')
        .action(() => {
            logger.info('Starting project initialization...');
        });
}
