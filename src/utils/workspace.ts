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
        ├── process/                 # Intermediate data and cache during generation
        │   ├── validation/          # Validation reports, screenshots, and processed.json
        │   └── ...                  # Other process artifacts
        ├── reports.html             # Validation reports summary
        └── checkpoint/              # Cache
            ├── coderio-cli.db          
            └── checkpoint.json         
*/
class Workspace {
    path: WorkspaceStructure | null = null;

    initWorkspace(subPath: string, rootPath?: string, appName?: string): WorkspaceStructure {
        if (this.path) {
            return this.path;
        }

        const root = rootPath || (process.env.CODERIO_CLI_USER_CWD ?? process.cwd());
        const coderioRoot = path.join(root, 'coderio');
        const finalRoot = path.resolve(coderioRoot, subPath);
        const app = appName || 'my-app';

        const absoluteRoot = path.resolve(finalRoot);
        const processDir = path.join(absoluteRoot, 'process');
        const checkpointDir = path.join(absoluteRoot, 'checkpoint');
        const debugDir = path.join(absoluteRoot, 'debug');

        this.path = {
            root: absoluteRoot,
            app: path.join(absoluteRoot, app),
            process: processDir,
            debug: debugDir,
            reports: path.join(absoluteRoot, 'reports.html'),
            db: path.join(checkpointDir, 'coderio-cli.db'),
            checkpoint: path.join(checkpointDir, 'checkpoint.json'),
        };
        return this.path;
    }

    /**
     * Delete all files and directories inside the workspace
     * @param workspace - The workspace structure
     * @param preserve - Optional list of relative paths (from workspace root) to preserve from deletion
     */
    deleteWorkspace(workspace: WorkspaceStructure, preserve: string[] = []): void {
        try {
            if (!fs.existsSync(workspace.root)) return;

            // Build set of normalized relative paths to preserve
            const preserveFiles = new Set(preserve.map(p => path.normalize(p)));

            // Collect ancestor directories of preserved files
            const preserveDirs = new Set<string>();
            for (const p of preserveFiles) {
                let dir = path.dirname(p);
                while (dir !== '.') {
                    preserveDirs.add(dir);
                    dir = path.dirname(dir);
                }
            }

            const deleteRecursive = (dirPath: string, relativeTo: string = '') => {
                const entries = fs.readdirSync(dirPath);
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry);
                    const relPath = relativeTo ? path.join(relativeTo, entry) : entry;

                    if (preserveFiles.has(relPath)) {
                        continue; // This file is preserved
                    }

                    if (preserveDirs.has(relPath)) {
                        // Directory contains preserved files, recurse into it
                        deleteRecursive(fullPath, relPath);
                    } else {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                    }
                }
            };

            deleteRecursive(workspace.root);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.printWarnLog(`Failed to delete workspace: ${errorMessage}`);
        }
    }

    /**
     * Resolve the absolute path to the source code directory
     * @param paths - The workspace structure
     * @param srcSubPath - The subpath to the source code directory
     * @returns The absolute path to the source code directory
     */
    resolveAppSrc(paths: WorkspaceStructure, srcSubPath: string): string {
        return path.join(paths.app, 'src', srcSubPath);
    }

    /**
     * Resolve component alias path to absolute filesystem path.
     *
     * Handles various path formats:
     * - @/components/Button → /workspace/my-app/src/components/Button/index.tsx
     * - @/src/components/Button → /workspace/my-app/src/components/Button/index.tsx
     * - components/Button → /workspace/my-app/src/components/Button/index.tsx
     *
     */
    resolveComponentPath(aliasPath: string): string {
        // Normalize path separators for robustness across platforms.
        const normalizedAlias = aliasPath.replace(/\\/g, '/');

        // Step 1: Strip @/ prefix if present
        let relativePath = normalizedAlias.startsWith('@/')
            ? normalizedAlias.substring(2) // '@/components/Button' → 'components/Button'
            : normalizedAlias;

        // Step 2: Strip 'src/' prefix if present (resolveAppSrc adds it)
        // '@/src/components/Button' → 'components/Button'
        if (relativePath.startsWith('src/')) {
            relativePath = relativePath.substring(4);
        }

        // Step 3: Ensure path ends with /index.tsx (all components follow this convention)
        if (!relativePath.endsWith('.tsx') && !relativePath.endsWith('.ts')) {
            relativePath = `${relativePath}/index.tsx`;
        }

        return relativePath;
    }
}
export const workspaceManager = new Workspace();
