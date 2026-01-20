import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';

import type { FrameStructNode, FigmaFrameInfo } from '../types/figma-types';
import type { WorkspaceStructure } from '../types/workspace-types';
import { logger } from '../utils/logger';
import { runValidation } from '../nodes/validation';
import { extractFigmaTreeFromProtocol } from '../nodes/validation/utils/extraction/extract-figma-tree.js';

type ValCommandOptions = {
    workspace: string;
    appName?: string;
    reportonly?: boolean;
};

function readJsonFile<T>(absolutePath: string): T {
    const raw = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(raw) as T;
}

function resolveWorkspaceRoot(input: string): string {
    if (input.startsWith('~')) {
        const home = process.env.HOME;
        if (!home) {
            throw new Error(
                'HOME environment variable is not set. Cannot resolve ~ in workspace path. ' +
                    'Please use an absolute path or set the HOME environment variable.'
            );
        }
        return path.resolve(path.join(home, input.slice(1)));
    }
    return path.resolve(input);
}

function normalizeProtocol(raw: unknown): FrameStructNode {
    // Backward compatibility: some past versions may have written { protocol: { ... } }
    if (raw && typeof raw === 'object' && 'protocol' in (raw as Record<string, unknown>)) {
        return (raw as { protocol: FrameStructNode }).protocol;
    }
    return raw as FrameStructNode;
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
        .option('--appName <name>', 'Generated app folder name inside workspace root', 'my-app')
        .option('--reportonly', 'Run report-only validation (no code edits)', false)
        .action(async (opts: ValCommandOptions) => {
            try {
                const workspaceRoot = resolveWorkspaceRoot(opts.workspace);
                const appName = opts.appName || 'my-app';
                const mode: 'reportOnly' | 'full' = opts.reportonly ? 'reportOnly' : 'full';

                const workspace: WorkspaceStructure = {
                    root: workspaceRoot,
                    app: path.join(workspaceRoot, appName),
                    process: path.join(workspaceRoot, 'process'),
                    reports: path.join(workspaceRoot, 'reports.html'),
                    db: path.join(workspaceRoot, 'coderio-cli.db'),
                    checkpoint: path.join(workspaceRoot, 'checkpoint.json'),
                };
                const protocolPath = path.join(workspace.process, 'protocol.json');

                if (!fs.existsSync(protocolPath)) {
                    throw new Error(`Missing protocol at: ${protocolPath}. Run d2p/d2c first to generate process/protocol.json.`);
                }

                const rawProtocol = readJsonFile<unknown>(protocolPath);
                const protocol = normalizeProtocol(rawProtocol);

                // Extract Figma tree and thumbnail from protocol
                const figmaJson = extractFigmaTreeFromProtocol(protocol);
                const figmaThumbnailUrl =
                    figmaJson.thumbnailUrl || (protocol.data.elements?.[0] as FigmaFrameInfo | undefined)?.thumbnailUrl;

                if (!figmaThumbnailUrl) {
                    throw new Error('Missing thumbnailUrl in protocol. Ensure d2p/d2c generated protocol with thumbnail data.');
                }

                logger.printInfoLog(`Running validation (${mode}) using workspace: ${workspace.root}`);

                const update = await runValidation(
                    {
                        // Note: fileId and nodeId are null (not undefined) to match FigmaUrlInfo type requirements
                        // Other optional fields use undefined as per GraphState annotation
                        urlInfo: { fileId: null, name: path.basename(workspaceRoot), nodeId: null, projectName: null },
                        workspace,
                        figmaInfo: { thumbnail: figmaThumbnailUrl },
                        protocol,
                        validationSatisfied: undefined,
                        validationReportDir: undefined,
                        validationReportHtmlPath: undefined,
                        messages: [],
                    },
                    undefined,
                    { mode }
                );

                process.exit(update.validationSatisfied ? 0 : 1);
            } catch (error) {
                logger.printErrorLog(`Error during val execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
}
