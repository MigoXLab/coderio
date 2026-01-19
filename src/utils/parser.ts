/**
 * Response parsing utilities for AI model outputs.
 * Handles extraction of structured content from markdown-formatted responses.
 */

import { FileInfo } from '../types/file-types';

/**
 * Extract JSON content from markdown code blocks
 * Handles cases where AI models wrap JSON in ```json ... ``` or ``` ... ```
 * If no code block markers are found, returns the original content
 *
 * @param response - Model response that may contain markdown code blocks
 * @returns Extracted JSON string without markdown formatting
 *
 * @example
 * // Input: "```json\n{\"key\": \"value\"}\n```"
 * // Output: "{\"key\": \"value\"}"
 */
export function extractJSONFromMarkdown(response: string): string {
    // Try to match ```json ... ``` format first
    const jsonBlockMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
        return jsonBlockMatch[1].trim();
    }

    // Try to match generic ``` ... ``` format
    const codeBlockMatch = response.match(/```\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
        return codeBlockMatch[1].trim();
    }

    // If no markdown code blocks found, return original content trimmed
    return response.trim();
}

/**
 * Extract code content from markdown code blocks
 * Handles cases where AI models wrap code in ```tsx ... ``` or ``` ... ```
 * If no code block markers are found, returns the original content
 */
export function extractCode(response: string): string {
    // 1. Try to extract content strictly within ``` fences
    // Regex captures content between ```language and ```
    const codeBlockMatch = response.match(/```(?:tsx|typescript|react|js|javascript|json|css|less|scss)?\s*\n([\s\S]*?)```/);

    if (codeBlockMatch && codeBlockMatch[1]) {
        return codeBlockMatch[1].trim();
    }

    // 2. Fallback: If no clear block structure is found (or fences are missing/malformed),
    // try to strip loose fences just in case, but usually method 1 catches the block.
    // If the model returned JUST code without fences, this preserves it.
    // If the model returned "Here is code: code", this returns the whole string (which might be bad, but safest fallback).

    // Removing loose fences if any remain (unlikely if method 1 failed but good for cleanup)
    const cleaned = response
        .replace(/```(tsx|typescript|react|js|javascript|json|css|less|scss)?/g, '')
        .replace(/```/g, '')
        .trim();

    return cleaned;
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
export function extractFiles(content: string): FileInfo[] {
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
