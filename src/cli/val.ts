import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

import type { FrameStructNode, FigmaFrameInfo } from '../types/figma-types';
import { ProjectWorkspace } from '../utils/workspace';
import { logger } from '../utils/logger';
import { runValidation } from '../nodes/validation';

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

                const workspace = new ProjectWorkspace(workspaceRoot, appName);
                const protocolPath = path.join(workspace.paths.process, 'protocol.json');
                const processedFigmaPath = path.join(workspace.paths.process, 'processed-figma.json');

                if (!fs.existsSync(protocolPath)) {
                    throw new Error(`Missing protocol at: ${protocolPath}. Run d2p/d2c first to generate process/protocol.json.`);
                }
                if (!fs.existsSync(processedFigmaPath)) {
                    throw new Error(
                        `Missing processed Figma at: ${processedFigmaPath}. Re-run d2p/d2c with the updated version to generate process/processed-figma.json.`
                    );
                }

                const rawProtocol = readJsonFile<unknown>(protocolPath);
                const protocol = normalizeProtocol(rawProtocol);
                const figmaJson = readJsonFile<FigmaFrameInfo>(processedFigmaPath);
                const figmaThumbnailUrl = figmaJson.thumbnailUrl;
                if (!figmaThumbnailUrl) {
                    throw new Error(
                        'Missing figma thumbnailUrl in processed-figma.json. Ensure the upstream process fetched images and set thumbnailUrl.'
                    );
                }

                logger.printInfoLog(`Running validation (${mode}) using workspace: ${workspace.paths.root}`);

                const update = await runValidation(
                    {
                        // Note: fileId and nodeId are null (not undefined) to match FigmaUrlInfo type requirements
                        // Other optional fields use undefined as per GraphState annotation
                        urlInfo: { fileId: null, name: path.basename(workspaceRoot), nodeId: null },
                        workspace,
                        figmaInfo: { thumbnail: figmaThumbnailUrl },
                        protocol,
                        processedFigma: figmaJson,
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
};
