import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeFile, createFiles } from '../../src/utils/file';

describe('file utilities', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coderio-file-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should create folder and write file content', () => {
        const folderPath = path.join(tempDir, 'nested', 'dir');
        writeFile(folderPath, 'hello.txt', 'hello');

        const fullPath = path.join(folderPath, 'hello.txt');
        expect(fs.existsSync(fullPath)).toBe(true);
        expect(fs.readFileSync(fullPath, 'utf-8')).toBe('hello');
    });

    it('should no-op when missing required arguments', () => {
        writeFile('', 'a.txt', 'content');
        writeFile(tempDir, '', 'content');
        writeFile(tempDir, 'a.txt', '');

        expect(fs.readdirSync(tempDir)).toHaveLength(0);
    });

    it('createFiles should write multiple files to directory derived from filePath', () => {
        const outputFilePath = path.join(tempDir, 'App.tsx');
        createFiles({
            filePath: outputFilePath,
            files: [
                { filename: 'A.ts', content: 'export const A = 1;' },
                { filename: 'B.ts', content: 'export const B = 2;' },
            ],
        });

        expect(fs.readFileSync(path.join(tempDir, 'A.ts'), 'utf-8')).toBe('export const A = 1;');
        expect(fs.readFileSync(path.join(tempDir, 'B.ts'), 'utf-8')).toBe('export const B = 2;');
    });
});
