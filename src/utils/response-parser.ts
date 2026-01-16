import { FileInfo } from './file';

/**
 * Extract code from markdown code blocks
 * Handles single code block format: ```language\ncode\n```
 */
export function extractCode(content: string): string {
    // Match markdown code blocks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);

    if (match && match[1]) {
        return match[1].trim();
    }

    // If no code block found, return the content as-is (might be plain code)
    return content.trim();
}

/**
 * Extract multiple files from content with file headers
 * Format:
 * ## filename.tsx
 * ```tsx
 * code...
 * ```
 *
 * ## filename.css
 * ```css
 * styles...
 * ```
 */
export function extractFilesFromContent(content: string): FileInfo[] {
    const files: FileInfo[] = [];

    // Match file sections: ## filename\n```language\ncode\n```
    // Allow optional whitespace around newlines for flexibility
    const fileRegex = /##\s+([^\n]+)\s*\n\s*```(?:\w+)?\s*\n([\s\S]*?)\n\s*```/g;
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
        if (match[1] && match[2]) {
            const filename = match[1].trim();
            const code = match[2].trim();
            files.push({ filename, content: code });
        }
    }

    return files;
}
