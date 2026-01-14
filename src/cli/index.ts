#!/usr/bin/env node

/**
 * CLI Entry Point for Coderio.
 * This file handles command registration, argument parsing, and global error handling for the CLI.
 */

// Save the user's current working directory before any operations
process.env.CODERIO_CLI_USER_CWD = process.cwd();

import { Command } from 'commander';
import { registerCommands } from './init';

async function main(argv: string[]): Promise<void> {
    const program = new Command();

    // Register all commands
    registerCommands(program);

    if (argv.length <= 2) {
        program.help({ error: false });
        return;
    }

    // Parse arguments and execute actions
    await program.parseAsync(argv);
}

main(process.argv).catch(err => {
    const error = err as Error;
    // TODO: Replace with a proper logger in the future
    console.error(error.message || String(error));
    process.exit(1);
});
