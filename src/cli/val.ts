import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';

import type { FrameStructNode, FigmaFrameInfo } from '../types/figma-types';
import type { ValidationConfig } from '../types/graph-types';
import { logger } from '../utils/logger';
import { runValidation } from '../nodes/validation';
import { initWorkspace } from '../utils/workspace';

type ValCommandOptions = {
    workspace: string;
    appName?: string;
    reportonly?: boolean;
};

function readJsonFile<T>(absolutePath: string): T {
    const raw = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(raw) as T;
}

/**
 * Extract thumbnail URL from protocol elements.
 */
function findThumbnailInProtocol(protocol: FrameStructNode): string | undefined {
    const elements = protocol.data.elements as FigmaFrameInfo[] | undefined;
    if (!elements) return undefined;

    // Check root level
    for (const element of elements) {
        if (element.thumbnailUrl) {
            return element.thumbnailUrl;
        }
        // Check first-level children
        if (element.children) {
            for (const child of element.children) {
                if (child.thumbnailUrl) {
                    return child.thumbnailUrl;
                }
            }
        }
    }
    return undefined;
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
        .requiredOption('-w, --workspace <path>', 'Workspace root path (contains process/ and generated app folder)')
        .option('--appName [name]', 'Generated app folder name inside workspace root', 'my-app')
        .option('--reportonly', 'Run report-only validation (no code edits)', false)
        .action(async (opts: ValCommandOptions) => {
            try {
                const projectName = path.basename(path.resolve(opts.workspace));
                const workspace = initWorkspace(projectName, undefined, opts.appName);
                const protocolPath = path.join(workspace.process, 'protocol.json');

                if (!fs.existsSync(protocolPath)) {
                    throw new Error(`Missing protocol at: ${protocolPath}. Run d2p/d2c first to generate process/protocol.json.`);
                }

                const protocol = readJsonFile<FrameStructNode>(protocolPath);

                // Extract thumbnail URL from protocol elements
                const figmaThumbnailUrl = findThumbnailInProtocol(protocol);

                if (!figmaThumbnailUrl) {
                    throw new Error('Missing thumbnailUrl in protocol. Ensure d2p/d2c generated protocol with thumbnail data.');
                }

                // Build ValidationConfig from CLI options
                const config: ValidationConfig = {
                    validationMode: opts.reportonly ? 'reportOnly' : 'full',
                };

                logger.printInfoLog(`Running validation (${config.validationMode}) using workspace: ${workspace.root}`);

                const result = await runValidation({
                    urlInfo: { fileId: null, name: projectName, nodeId: null, projectName: null },
                    workspace,
                    figmaInfo: { thumbnail: figmaThumbnailUrl },
                    protocol,
                    messages: [],
                    config,
                });

                process.exit(result.validationPassed ? 0 : 1);
            } catch (error) {
                logger.printErrorLog(`Error during val execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
}
