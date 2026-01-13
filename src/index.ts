#!/usr/bin/env node

// Save the user's current working directory before any operations
process.env.CODERIO_CLI_USER_CWD = process.cwd();

import { Command } from 'commander';
import { registerCommands } from './commands';

async function main(argv: string[]): Promise<void> {
    const program = new Command();

    // Register all commands
    registerCommands(program);

    if (argv.length <= 2) {
        program.help({ error: false });
        return;
    }

    // Parse arguments
    await program.parseAsync(argv);
}

main(process.argv).catch(err => {
    const error = err as Error;
    // TODO: Handle error
    console.error(error.message || String(error));
    process.exit(1);
});
