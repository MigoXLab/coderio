import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('checkpoint utilities', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        // Silence logger output for deterministic test output
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unmock('@langchain/langgraph-checkpoint-sqlite');
        vi.unmock('../../src/cli/prompts');
        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    async function importCheckpointModule({
        promptChoice = 'resume',
        fromConnStringImpl,
    }: {
        promptChoice?: 'resume' | 'fresh';
        fromConnStringImpl?: (dbPath: string) => any;
    } = {}) {
        const fromConnString = vi.fn((dbPath: string) => (fromConnStringImpl ? fromConnStringImpl(dbPath) : { dbPath }));

        // Mock external dependency to avoid touching real sqlite/checkpointer implementation.
        vi.doMock('@langchain/langgraph-checkpoint-sqlite', () => ({
            SqliteSaver: class SqliteSaver {
                static fromConnString = fromConnString;
            },
        }));

        vi.doMock('../../src/cli/prompts', () => ({
            promptUserChoice: vi.fn(async () => promptChoice),
        }));

        const mod = await import('../../src/utils/checkpoint');
        return { mod, fromConnString };
    }

    it('initializeSqliteSaver should create parent directory and call fromConnString', async () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coderio-ckpt-'));
        try {
            const dbDir = path.join(tempDir, 'checkpoint');
            const dbPath = path.join(dbDir, 'coderio-cli.db');

            expect(fs.existsSync(dbDir)).toBe(false);

            const { mod, fromConnString } = await importCheckpointModule();
            const saver = mod.initializeSqliteSaver(dbPath);

            expect(fs.existsSync(dbDir)).toBe(true);
            expect(fromConnString).toHaveBeenCalledWith(dbPath);
            expect(saver).toEqual({ dbPath });
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('promptCheckpointChoice should return undefined when no checkpoint exists', async () => {
        const { mod } = await importCheckpointModule({ promptChoice: 'resume' });

        const checkpointer = {
            list: vi.fn(() => ({
                next: vi.fn(async () => ({ done: true, value: undefined })),
            })),
        };

        const result = await mod.promptCheckpointChoice(checkpointer as any, 't1');
        expect(result).toBeUndefined();
    });

    it('promptCheckpointChoice should return true when checkpoint exists and user chooses resume', async () => {
        const { mod } = await importCheckpointModule({ promptChoice: 'resume' });

        const checkpointer = {
            list: vi.fn(() => ({
                next: vi.fn(async () => ({ done: false, value: { id: 1 } })),
            })),
        };

        const result = await mod.promptCheckpointChoice(checkpointer as any, 't2');
        expect(result).toBe(true);
    });

    it('promptCheckpointChoice should return false when checkpoint exists and user chooses fresh', async () => {
        const { mod } = await importCheckpointModule({ promptChoice: 'fresh' });

        const checkpointer = {
            list: vi.fn(() => ({
                next: vi.fn(async () => ({ done: false, value: { id: 1 } })),
            })),
        };

        const result = await mod.promptCheckpointChoice(checkpointer as any, 't3');
        expect(result).toBe(false);
    });

    it('clearThreadCheckpoint should call deleteThread and swallow errors', async () => {
        const { mod } = await importCheckpointModule();

        const deleteThread = vi.fn(async () => {
            throw new Error('fail');
        });

        const checkpointer = { deleteThread };
        await expect(mod.clearThreadCheckpoint(checkpointer as any, 't4')).resolves.toBeUndefined();
        expect(deleteThread).toHaveBeenCalledWith('t4');
    });
});
