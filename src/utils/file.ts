import fs from 'node:fs';
import path from 'node:path';
import { logger } from './logger';
import { FileInfo } from '../types/file-types';

/**
 * Write file to the specified path
 * @param filePath - The path to the file
 * @param content - The content to write to the file
 */
export const writeFile = (folderPath: string, filePath: string, content: string) => {
    if (!folderPath || !filePath || !content) {
        return;
    }
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(path.join(folderPath, filePath), content);
};

/**
 * Create multiple files from parsed data
 */
export function createFiles({ files, filePath }: { files: FileInfo[]; filePath: string }): void {
    try {
        for (const file of files) {
            const dirPath = path.dirname(filePath);
            writeFile(dirPath, file.filename, file.content);
        }
    } catch (error) {
        logger.printErrorLog(`Failed to create files in ${filePath}: ${(error as Error).message}`);
        throw error;
    }
}
