import { Command } from 'commander';
import { createInitCommand } from './init';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { CLI_NAME } from '../constants';

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
/**
 * Register all commands to the program
 */
export function registerCommands(program: Command): void {
    program
        .name(CLI_NAME)
        .description(`${CLI_NAME} - Convert Figma designs to code`)
        .version(getPackageVersion(), '-v, -V, --version', 'Output the version number')
        .showHelpAfterError();

    program.addCommand(createInitCommand());
}
