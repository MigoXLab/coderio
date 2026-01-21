import path from 'node:path';
import fs from 'node:fs';
import { WorkspaceStructure } from '../types/workspace-types';
import { logger } from './logger';

/**
 * Defines the logical structure of the output workspace.
 * output directory structure
    coderio/
    └── figmaName/                   # Project root directory generated from a Figma URL
        ├── my-app/                  # Generated project source code
        ├── process/                 # Intermediate data and cache during generation (if any)
        │   └── ...                  # Others
        ├── reports.html             # Validation reports and screenshots
        └── coderio-cli.db           # Cache database (if any)
*/

export const initWorkspace = (subPath: string, rootPath?: string, appName?: string): WorkspaceStructure => {
    const root = rootPath || (process.env.CODERIO_CLI_USER_CWD ?? process.cwd());
    const coderioRoot = path.join(root, 'coderio');
    const finalRoot = path.resolve(coderioRoot, subPath);
    const app = appName || 'my-app';

    const absoluteRoot = path.resolve(finalRoot);
    const processDir = path.join(absoluteRoot, 'process');

    return {
        root: absoluteRoot,
        app: path.join(absoluteRoot, app),
        process: processDir,
        reports: path.join(absoluteRoot, 'reports.html'),
        db: path.join(absoluteRoot, 'coderio-cli.db'),
        checkpoint: path.join(absoluteRoot, 'checkpoint.json'),
    };
};

export const resolveAppSrc = (paths: WorkspaceStructure, srcSubPath: string): string => {
    return path.join(paths.app, 'src', srcSubPath);
};

/**
 * Delete all files and directories inside the workspace
 */
export function deleteWorkspace(workspace: WorkspaceStructure): void {
    try {
        if (fs.existsSync(workspace.root)) {
            // Read all entries in the workspace root
            const entries = fs.readdirSync(workspace.root);

            // Delete each entry
            for (const entry of entries) {
                const fullPath = path.join(workspace.root, entry);
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printWarnLog(`Failed to delete workspace: ${errorMessage}`);
    }
}
