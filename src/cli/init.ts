import { Command } from 'commander';
import { CLI_NAME } from '../constants';

/* Register all commands to the program */
export function registerCommands(program: Command): void {
    const version = typeof __VERSION__ === 'undefined' ? '0.0.1' : __VERSION__;
    program
        .name(CLI_NAME)
        .description(`${CLI_NAME} - Convert Figma designs to code`)
        .version(version, '-v, -V, --version', 'Output the version number')
        .showHelpAfterError();
}
