import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { workspaceManager } from '../../src/utils/workspace';
import { WorkspaceStructure } from '../../src/types/workspace-types';

describe('workspaceManager', () => {
    let tempRoot: string;

    beforeEach(() => {
        // Reset singleton internal state between tests
        (workspaceManager as any).path = null;
        tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'coderio-ws-'));
    });

    afterEach(() => {
        fs.rmSync(tempRoot, { recursive: true, force: true });
        (workspaceManager as any).path = null;
    });

    it('initWorkspace should compute workspace structure and cache it', () => {
        const ws1 = workspaceManager.initWorkspace('proj', tempRoot, 'my-app');
        const ws2 = workspaceManager.initWorkspace('other', '/should-not-apply', 'other-app');

        expect(ws2).toBe(ws1);
        expect(ws1.root).toBe(path.resolve(tempRoot, 'coderio', 'proj'));
        expect(ws1.app).toBe(path.join(ws1.root, 'my-app'));
        expect(ws1.process).toBe(path.join(ws1.root, 'process'));
        expect(ws1.debug).toBe(path.join(ws1.root, 'debug'));
        expect(ws1.reports).toBe(path.join(ws1.root, 'reports.html'));
        expect(ws1.db).toBe(path.join(ws1.root, 'checkpoint', 'coderio-cli.db'));
        expect(ws1.checkpoint).toBe(path.join(ws1.root, 'checkpoint', 'checkpoint.json'));
    });

    it('resolveAppSrc should join app/src with subpath', () => {
        const paths: WorkspaceStructure = {
            root: '/r',
            app: '/r/my-app',
            process: '/r/process',
            debug: '/r/debug',
            reports: '/r/reports.html',
            db: '/r/checkpoint/db.sqlite',
            checkpoint: '/r/checkpoint/checkpoint.json',
        };

        expect(workspaceManager.resolveAppSrc(paths, 'components/Button')).toBe(path.join(paths.app, 'src', 'components/Button'));
    });

    it('resolveComponentPath should normalize common alias variants', () => {
        expect(workspaceManager.resolveComponentPath('@/components/Button')).toBe('components/Button/index.tsx');
        expect(workspaceManager.resolveComponentPath('@/src/components/Button')).toBe('components/Button/index.tsx');
        expect(workspaceManager.resolveComponentPath('components/Button')).toBe('components/Button/index.tsx');
        expect(workspaceManager.resolveComponentPath('components/Button.tsx')).toBe('components/Button.tsx');
        expect(workspaceManager.resolveComponentPath('components/Button/index.tsx')).toBe('components/Button/index.tsx');
    });

    it('deleteWorkspace should delete all entries inside workspace root', () => {
        const root = path.join(tempRoot, 'workspace');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'a.txt'), 'a');
        fs.mkdirSync(path.join(root, 'dir'));
        fs.writeFileSync(path.join(root, 'dir', 'b.txt'), 'b');

        const ws: WorkspaceStructure = {
            root,
            app: '',
            process: '',
            debug: '',
            reports: '',
            db: '',
            checkpoint: '',
        };

        workspaceManager.deleteWorkspace(ws);

        expect(fs.existsSync(root)).toBe(true);
        expect(fs.readdirSync(root)).toHaveLength(0);
    });

    it('deleteWorkspace should preserve specified files while deleting others', () => {
        const root = path.join(tempRoot, 'workspace-preserve');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'a.txt'), 'a');
        fs.writeFileSync(path.join(root, 'delete-me.txt'), 'delete');
        fs.mkdirSync(path.join(root, 'checkpoint'), { recursive: true });
        fs.writeFileSync(path.join(root, 'checkpoint', 'coderio-cli.db'), 'db');
        fs.writeFileSync(path.join(root, 'checkpoint', 'checkpoint.json'), 'json');
        fs.mkdirSync(path.join(root, 'process'), { recursive: true });
        fs.writeFileSync(path.join(root, 'process', 'data.txt'), 'data');

        const ws: WorkspaceStructure = {
            root,
            app: '',
            process: '',
            debug: '',
            reports: '',
            db: '',
            checkpoint: '',
        };

        // Preserve only the database file
        workspaceManager.deleteWorkspace(ws, ['checkpoint/coderio-cli.db']);

        // Root should still exist
        expect(fs.existsSync(root)).toBe(true);

        // checkpoint directory should still exist (contains preserved file)
        expect(fs.existsSync(path.join(root, 'checkpoint'))).toBe(true);

        // Database file should be preserved
        expect(fs.existsSync(path.join(root, 'checkpoint', 'coderio-cli.db'))).toBe(true);
        expect(fs.readFileSync(path.join(root, 'checkpoint', 'coderio-cli.db'), 'utf8')).toBe('db');

        // checkpoint.json should be deleted
        expect(fs.existsSync(path.join(root, 'checkpoint', 'checkpoint.json'))).toBe(false);

        // Other files and directories should be deleted
        expect(fs.existsSync(path.join(root, 'a.txt'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'delete-me.txt'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'process'))).toBe(false);
    });
});
