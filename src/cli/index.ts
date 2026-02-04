#!/usr/bin/env node

/**
 * CLI Entry Point for Coderio.
 * This file handles command registration, argument parsing, and global error handling for the CLI.
 */

// Save the user's current working directory before any operations
process.env.CODERIO_CLI_USER_CWD = process.cwd();

import { Command } from 'commander';
import { registerCommands } from './init';
import { logger } from '../utils/logger';
import { registerD2PCommand } from './d2p';
import { registerD2CCommand } from './d2c';
import { registerImagesCommand } from './images';
import { registerP2CCommand } from './p2c';
import { registerValidateCommand } from './val';

async function main(argv: string[]): Promise<void> {
    const program = new Command();

    // Register all commands
    registerCommands(program);
    registerD2CCommand(program);
    registerD2PCommand(program);
    registerP2CCommand(program);
    registerImagesCommand(program);
    registerValidateCommand(program);

    if (argv.length <= 2) {
        program.help({ error: false });
        return;
    }

    // Parse arguments and execute actions
    await program.parseAsync(argv);
}

main(process.argv).catch(err => {
    const error = err as Error;
    logger.printErrorLog(`${error.message || String(error)}`);
    process.exit(1);
});
