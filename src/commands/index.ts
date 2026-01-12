import { Command } from 'commander';
// import { registerFigma2CodeCommand } from './figma2code';
// import { registerGetImageCommand } from './get-image';
// import { registerScanCommand } from './scan';
import { createInitCommand } from './init';

/**
 * Register all commands to the program
 */
export function registerCommands(program: Command): void {
    // registerFigma2CodeCommand(program);
    // registerGetImageCommand(program);
    // registerScanCommand(program);
    program.addCommand(createInitCommand());
}
