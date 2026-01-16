import path from 'node:path';
import { WorkspaceStructure } from '../types/workspace-types';

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
export class ProjectWorkspace {
    public readonly paths: WorkspaceStructure;

    constructor(rootPath: string, appName: string) {
        const absoluteRoot = path.resolve(rootPath);
        const processDir = path.join(absoluteRoot, 'process');

        this.paths = {
            root: absoluteRoot,
            app: path.join(absoluteRoot, appName),
            process: processDir,
            reports: path.join(absoluteRoot, 'reports.html'),
            db: path.join(absoluteRoot, 'coderio-cli.db'),
        };
    }

    resolveAppSrc(srcSubPath: string): string {
        return path.join(this.paths.app, 'src', srcSubPath);
    }
}

export const createDefaultWorkspace = (subPath: string, rootPath?: string, appName?: string) => {
    const root = rootPath || (process.env.CODERIO_CLI_USER_CWD ?? process.cwd());
    const coderioRoot = path.join(root, 'coderio');
    const finalRoot = path.resolve(coderioRoot, subPath);
    const app = appName || 'my-app';
    return new ProjectWorkspace(finalRoot, app);
};
