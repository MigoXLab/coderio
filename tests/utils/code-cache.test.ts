import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
    isAppInjected,
    isComponentGenerated,
    loadCodeCache,
    markAppInjected,
    markComponentGenerated,
    saveAppInjected,
    saveCodeCache,
    saveComponentGenerated,
} from '../../src/utils/code-cache';
import { WorkspaceStructure } from '../../src/types/workspace-types';

describe('code-cache utilities', () => {
    let tempDir: string;
    let logSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Silence logger output for deterministic test output
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coderio-cache-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    function makeWorkspace(checkpointPath: string, processPath: string): WorkspaceStructure {
        return {
            root: tempDir,
            app: path.join(tempDir, 'my-app'),
            process: processPath,
            debug: path.join(tempDir, 'debug'),
            reports: path.join(tempDir, 'reports.html'),
            db: path.join(tempDir, 'checkpoint', 'coderio-cli.db'),
            checkpoint: checkpointPath,
        };
    }

    it('should default to empty cache when file does not exist', () => {
        const ws = makeWorkspace(path.join(tempDir, 'process', 'checkpoint.json'), path.join(tempDir, 'process'));
        const cache = loadCodeCache(ws);

        expect(cache).toEqual({ generatedComponents: [], appInjected: false });
    });

    it('should treat invalid JSON as empty cache', () => {
        const checkpointPath = path.join(tempDir, 'process', 'checkpoint.json');
        fs.mkdirSync(path.dirname(checkpointPath), { recursive: true });
        fs.writeFileSync(checkpointPath, '{not-json', 'utf-8');

        const ws = makeWorkspace(checkpointPath, path.join(tempDir, 'process'));
        const cache = loadCodeCache(ws);

        expect(cache).toEqual({ generatedComponents: [], appInjected: false });
    });

    it('should treat invalid cache shape as empty cache', () => {
        const checkpointPath = path.join(tempDir, 'process', 'checkpoint.json');
        fs.mkdirSync(path.dirname(checkpointPath), { recursive: true });
        fs.writeFileSync(checkpointPath, JSON.stringify({ generatedComponents: 'nope', appInjected: 'nope' }), 'utf-8');

        const ws = makeWorkspace(checkpointPath, path.join(tempDir, 'process'));
        const cache = loadCodeCache(ws);

        expect(cache).toEqual({ generatedComponents: [], appInjected: false });
    });

    it('saveCodeCache should persist cache when checkpoint directory is writable', () => {
        const processPath = path.join(tempDir, 'process');
        const checkpointPath = path.join(processPath, 'checkpoint.json');
        const ws = makeWorkspace(checkpointPath, processPath);

        const cache = { generatedComponents: ['n1'], appInjected: true };
        saveCodeCache(ws, cache);

        expect(fs.existsSync(checkpointPath)).toBe(true);
        expect(JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'))).toEqual(cache);
    });

    it('saveCodeCache should not throw if checkpoint directory does not exist', () => {
        const processPath = path.join(tempDir, 'process');
        const checkpointPath = path.join(tempDir, 'checkpoint', 'checkpoint.json'); // Different dir from workspace.process
        const ws = makeWorkspace(checkpointPath, processPath);

        expect(() => saveCodeCache(ws, { generatedComponents: [], appInjected: false })).not.toThrow();
        expect(fs.existsSync(checkpointPath)).toBe(false);
    });

    it('should track generated components and app injection', () => {
        const cache = { generatedComponents: [], appInjected: false };

        expect(isComponentGenerated(cache, 'a')).toBe(false);
        markComponentGenerated(cache, 'a');
        expect(isComponentGenerated(cache, 'a')).toBe(true);

        // Idempotent
        markComponentGenerated(cache, 'a');
        expect(cache.generatedComponents).toEqual(['a']);

        expect(isAppInjected(cache)).toBe(false);
        markAppInjected(cache);
        expect(isAppInjected(cache)).toBe(true);
    });

    it('saveComponentGenerated and saveAppInjected should update cache and persist', () => {
        const processPath = path.join(tempDir, 'process');
        const checkpointPath = path.join(processPath, 'checkpoint.json');
        const ws = makeWorkspace(checkpointPath, processPath);

        const cache = { generatedComponents: [], appInjected: false };
        saveComponentGenerated(cache, 'node-1', ws);
        saveAppInjected(cache, ws);

        const loaded = loadCodeCache(ws);
        expect(loaded.generatedComponents).toContain('node-1');
        expect(loaded.appInjected).toBe(true);
    });
});
