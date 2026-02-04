/**
 * Standard naming utilities for the project.
 * Ensures consistency between kebab-case file paths and PascalCase component names.
 */

/**
 * Converts a string to PascalCase (e.g. "my-component" -> "MyComponent")
 * Used for Component Names and imports.
 */
export function toPascalCase(str: string): string {
    // 1. Replace special chars with space
    // 2. Split by space or capital letters
    // 3. Capitalize first letter of each part
    return str
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * Converts a string to kebab-case (e.g. "MyComponent" -> "my-component")
 * Used for file paths and directories.
 */
export function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Split camelCase
        .replace(/[^a-zA-Z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .toLowerCase()
        .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}
