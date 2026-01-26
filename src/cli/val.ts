import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';

import type { FrameStructNode } from '../types/figma-types';
import type { ValidationConfig } from '../types/graph-types';
import { logger } from '../utils/logger';
import { runValidation } from '../nodes/validation';
import { initWorkspace } from '../utils/workspace';

type ValCommandOptions = {
    workspace?: string;
    url: string;
    reportonly?: boolean;
};

function readJsonFile<T>(absolutePath: string): T {
    const raw = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(raw) as T;
}

/**
 * Register the 'validate' CLI command.
 * Validates position alignment using an existing workspace without re-running d2p/d2c.
 *
 * @param program - Commander program instance
 */
export function registerValidateCommand(program: Command): void {
    program
        .command('validate')
        .alias('val')
        .description('Validate position misalignment using an existing generated workspace')
        .option(
            '-w, --workspace [path]',
            'Workspace root path (contains process/ and generated app folder). Defaults to coderio/<current-dir> if not specified'
        )
        .requiredOption('-u, --url <url>', 'Figma thumbnail URL for validation')
        .option('--reportonly', 'Run report-only validation (no code edits)', false)
        .action(async (opts: ValCommandOptions) => {
            try {
                // Determine workspace and project name
                let workspace: ReturnType<typeof initWorkspace>;
                let projectName: string;

                if (opts.workspace) {
                    // Use explicit workspace path
                    const workspacePath = path.resolve(opts.workspace);
                    const parentPath = path.dirname(path.dirname(workspacePath)); // Go up to parent of 'coderio' folder
                    projectName = path.basename(workspacePath);
                    workspace = initWorkspace(projectName, parentPath);
                } else {
                    // Default: use current directory name as project name
                    projectName = path.basename(process.env.CODERIO_CLI_USER_CWD ?? process.cwd());
                    workspace = initWorkspace(projectName);
                }

                const protocolPath = path.join(workspace.process, 'protocol.json');

                if (!fs.existsSync(protocolPath)) {
                    throw new Error(`Missing protocol at: ${protocolPath}. Run d2p/d2c first to generate process/protocol.json.`);
                }

                const protocol = readJsonFile<FrameStructNode>(protocolPath);

                // Use the provided URL directly
                const figmaThumbnailUrl = opts.url;

                // Build ValidationConfig from CLI options
                const config: ValidationConfig = {
                    validationMode: opts.reportonly ? 'reportOnly' : 'full',
                };

                logger.printInfoLog(`Running validation (${config.validationMode}) using workspace: ${workspace.root}`);

                await runValidation({
                    urlInfo: { fileId: null, name: projectName, nodeId: null, projectName: null },
                    workspace,
                    figmaInfo: { thumbnail: figmaThumbnailUrl },
                    protocol,
                    messages: [],
                    config,
                });

                // If we reach here, validation passed
                process.exit(0);
            } catch (error) {
                logger.printErrorLog(`Error during val execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
}
