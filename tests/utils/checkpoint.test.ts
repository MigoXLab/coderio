import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { initializeSqliteSaver } from '../../src/utils/checkpoint';
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite';

// Mock fs
vi.mock('node:fs', () => ({
    default: {
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
    },
}));

// Mock SqliteSaver
vi.mock('@langchain/langgraph-checkpoint-sqlite', () => ({
    SqliteSaver: {
        fromConnString: vi.fn(),
    },
}));

describe('initializeSqliteSaver', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should use path.dirname and create directory if it does not exist', () => {
        const dbPath = '/path/to/db/file.db';
        const dbDir = '/path/to/db'; // Expected dirname on POSIX

        // Spy on path.dirname to ensure it is called
        // Note: path module is frozen in some environments, so spyOn might fail.
        // If so, we rely on the behavior correctness.
        const dirnameSpy = vi.spyOn(path, 'dirname');

        (fs.existsSync as Mock).mockReturnValue(false);

        initializeSqliteSaver(dbPath);

        expect(dirnameSpy).toHaveBeenCalledWith(dbPath);
        expect(fs.existsSync).toHaveBeenCalledWith(dbDir);
        expect(fs.mkdirSync).toHaveBeenCalledWith(dbDir, { recursive: true });
        expect(SqliteSaver.fromConnString).toHaveBeenCalledWith(dbPath);
    });
});
