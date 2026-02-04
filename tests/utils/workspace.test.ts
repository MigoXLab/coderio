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
});
