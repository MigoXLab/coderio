import * as fs from 'fs';
import * as path from 'path';

import { DEFAULT_GITIGNORE } from './git-ignore';

export function ensureGitignore(repoPath: string): void {
    const gitIgnorePath = path.join(repoPath, '.gitignore');
    if (!fs.existsSync(gitIgnorePath)) {
        fs.writeFileSync(gitIgnorePath, DEFAULT_GITIGNORE, 'utf-8');
    }
}

