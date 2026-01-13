#!/usr/bin/env node

// Save the user's current working directory before any operations
process.env.CODERIO_CLI_USER_CWD = process.cwd();

// TODO: Add env
// import { loadEnvironmentVariables } from './utils/env-loader';
// loadEnvironmentVariables();
import { Command } from 'commander';
import { registerCommands } from './commands';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { CLI_NAME } from './constants';

/**
 * Get package version from package.json
 */
function getPackageVersion(): string {
    // Try to read package.json next to dist/ or src/
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pkgPath = path.resolve(__dirname, '../package.json');
    try {
        const content = fs.readFileSync(pkgPath, 'utf8');
        const json = JSON.parse(content) as { version?: string };
        return json.version || '0.0.0';
    } catch {
        return '0.0.0';
    }
}

async function main(argv: string[]): Promise<void> {
    const program = new Command();

    // Configure program
    program
        .name(CLI_NAME)
        .description(`${CLI_NAME} - Convert Figma designs to code`)
        .version(getPackageVersion(), '-v, -V, --version', 'Output the version number')
        .showHelpAfterError();

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
