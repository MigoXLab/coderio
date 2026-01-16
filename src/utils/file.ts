import fs from 'node:fs';
import path from 'node:path';

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
