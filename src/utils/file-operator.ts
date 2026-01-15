import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * File information for batch creation
 */
export interface FileInfo {
    filename: string;
    content: string;
}

/**
 * Save content to a file, creating directories as needed
 */
export function saveContentToFile(content: string, filePath: string): void {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content, 'utf8');
        logger.printSuccessLog(`File saved: ${filePath}`);
    } catch (error) {
        logger.printErrorLog(`Failed to save file ${filePath}: ${(error as Error).message}`);
        throw error;
    }
}

/**
 * Create multiple files from parsed data
 */
export function createFilesFromParsedData({ files, dirPath }: { files: FileInfo[]; dirPath: string }): void {
    try {
        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Create each file
        for (const file of files) {
            const filePath = path.join(dirPath, file.filename);
            fs.writeFileSync(filePath, file.content, 'utf8');
            logger.printSuccessLog(`File created: ${filePath}`);
        }
    } catch (error) {
        logger.printErrorLog(`Failed to create files in ${dirPath}: ${(error as Error).message}`);
        throw error;
    }
}
