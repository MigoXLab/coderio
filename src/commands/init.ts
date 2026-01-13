import { Command } from 'commander';

export function createInitCommand() {
    return new Command('init')
        .description('Initialize a new project')
        .option('-n, --name <name>', 'Project name')
        .option('-f, --force', 'Force initialization (overwrite existing files)')
        .action(() => {
            console.log('Starting project initialization...');
        });
}
