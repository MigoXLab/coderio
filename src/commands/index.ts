import { Command } from 'commander';
import { createInitCommand } from './init';
import { CLI_NAME } from '../constants';

/**
 * Register all commands to the program
 */
export function registerCommands(program: Command): void {
    program
        .name(CLI_NAME)
        .description(`${CLI_NAME} - Convert Figma designs to code`)
        .version(__VERSION__, '-v, -V, --version', 'Output the version number')
        .showHelpAfterError();

    program.addCommand(createInitCommand());
}
