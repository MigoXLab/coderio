import * as fs from 'fs';
import * as path from 'path';

function normalizeToRepoPath(repoPath: string, candidate: string): string | null {
    if (!candidate) return null;
    const cleaned = candidate.replace(/["'`]/g, '').trim();
    if (!cleaned) return null;

    // Avoid noisy matches
    if (cleaned.includes('node_modules') || cleaned.includes('/dist/') || cleaned.includes('/.cache/')) {
        return null;
    }

    const abs = path.isAbsolute(cleaned) ? cleaned : path.resolve(repoPath, cleaned);
    if (!abs.startsWith(path.resolve(repoPath))) {
        return null;
    }
    if (!fs.existsSync(abs)) {
        return null;
    }
    return abs;
}

/**
 * Best-effort extraction of source file paths from build/runtime logs.
 * Returns absolute paths that exist on disk.
 */
export function extractCandidateFilesFromLog(repoPath: string, log: string): string[] {
    const results: string[] = [];
    const push = (p: string | null) => {
        if (!p) return;
        if (!results.includes(p)) results.push(p);
    };

    // Include common style/preprocessor files too (Vite CSS plugin errors often point to .scss/.css files).
    const supportedExt = '(?:ts|tsx|js|jsx|css|scss|sass|less)';

    // Format: src/App.tsx(12,34): error TS...
    const tsParen = new RegExp(`(\\S+\\.${supportedExt})\\(\\d+,\\d+\\)`, 'g');
    for (const m of log.matchAll(tsParen)) {
        if (m[1]) push(normalizeToRepoPath(repoPath, m[1]));
    }

    // Format: /abs/path/src/App.tsx:12:34
    const colonLineCol = new RegExp(`((?:\\/|\\.\\.?\\/)[^\\s:]+?\\.${supportedExt}):\\d+:\\d+`, 'g');
    for (const m of log.matchAll(colonLineCol)) {
        if (m[1]) push(normalizeToRepoPath(repoPath, m[1]));
    }

    // Generic format: src/App.tsx
    const generic = new RegExp("((?:src|app)\\/[^\\s\\\"'`]+?\\." + supportedExt + ')', 'g');
    for (const m of log.matchAll(generic)) {
        if (m[1]) push(normalizeToRepoPath(repoPath, m[1]));
    }

    // Vite often reports a dedicated "file:" line:
    // file: /abs/path/src/.../index.module.scss
    const fileLine = new RegExp(`\\bfile:\\s*((?:\\/|\\.\\.?\\/)[^\\s]+?\\.${supportedExt})\\b`, 'g');
    for (const m of log.matchAll(fileLine)) {
        if (m[1]) push(normalizeToRepoPath(repoPath, m[1]));
    }

    return results;
}

