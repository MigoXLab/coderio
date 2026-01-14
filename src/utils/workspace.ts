import path from 'node:path';
import { WorkspaceStructure } from '../types/workspace-types';

/**
 * Defines the logical structure of the output workspace.
 * output directory structure
    coderio/
    └── figmaName/                   # Project root directory generated from a Figma URL
        ├── my-app/                  # Generated project source code
        ├── process/                 # Intermediate data and cache during generation (if any)
        │   ├── validation/          # Comparison screenshots during the refine iteration process
        │   └── other...             # Others
        ├── reports.html             # Validation reports and screenshots
        └── coderio-cli.db           # Cache database (if any)
*/
export class ProjectWorkspace {
    public readonly paths: WorkspaceStructure;

    /**
     * @param rootPath - The absolute or relative path to the project root.
     * @param appName - The name of the application directory (defaults to 'my-app').
     */
    constructor(rootPath: string, appName: string) {
        const absoluteRoot = path.resolve(rootPath);
        const processDir = path.join(absoluteRoot, 'process');

        this.paths = {
            root: absoluteRoot,
            app: path.join(absoluteRoot, appName),
            process: processDir,
            validation: path.join(processDir, 'validation'),
            reports: path.join(absoluteRoot, 'reports.html'),
            db: path.join(absoluteRoot, 'coderio-cli.db'),
        };
    }

    /**
     * Resolves a sub-path relative to the application directory.
     * @param subPath - The relative path within the app directory.
     * @returns The absolute path to the sub-path.
     */
    resolveApp(subPath: string): string {
        return path.join(this.paths.app, subPath);
    }
}

/**
 * Default workspace instance helper.
 * Uses the environment variable CODERIO_CLI_USER_CWD or current working directory as default root.
 */
export const createDefaultWorkspace = (rootPath?: string, appName?: string) => {
    const root = rootPath || (process.env.CODERIO_CLI_USER_CWD ?? process.cwd());
    const app = appName || 'my-app';
    return new ProjectWorkspace(root, app);
};

/**
 * Global workspace singleton instance.
 */
export const workspace = createDefaultWorkspace();
