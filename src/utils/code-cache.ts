import fs from 'node:fs';
import { WorkspaceStructure } from '../types/workspace-types';
import { logger } from './logger';

/**
 * Code generation cache structure
 * Tracks which components have been generated and whether App.tsx has been injected
 */
export interface CodeCache {
    generatedComponents: string[]; // Array of node IDs that have been generated
    appInjected: boolean;
}

/**
 * Get the path to the cache file
 */
function getCachePath(workspace: WorkspaceStructure): string {
    return workspace.checkpoint;
}

/**
 * Load code generation cache from file
 * Returns empty cache if file doesn't exist or on error
 */
export function loadCodeCache(workspace: WorkspaceStructure): CodeCache {
    const cachePath = getCachePath(workspace);

    try {
        if (!fs.existsSync(cachePath)) {
            logger.printInfoLog('No code cache found, starting fresh');
            return createEmptyCache();
        }

        const content = fs.readFileSync(cachePath, 'utf-8');
        const cache = JSON.parse(content) as CodeCache;

        // Validate cache structure
        if (!Array.isArray(cache.generatedComponents) || typeof cache.appInjected !== 'boolean') {
            logger.printWarnLog('Invalid cache format, starting fresh');
            return createEmptyCache();
        }

        logger.printInfoLog(`Loaded code cache: ${cache.generatedComponents.length} components cached`);
        return cache;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printWarnLog(`Failed to load code cache: ${errorMessage}. Starting fresh.`);
        return createEmptyCache();
    }
}

/**
 * Save code generation cache to file
 */
export function saveCodeCache(workspace: WorkspaceStructure, cache: CodeCache): void {
    const cachePath = getCachePath(workspace);

    try {
        // Ensure process directory exists
        if (!fs.existsSync(workspace.process)) {
            fs.mkdirSync(workspace.process, { recursive: true });
        }

        const content = JSON.stringify(cache, null, 2);
        fs.writeFileSync(cachePath, content, 'utf-8');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printWarnLog(`Failed to save code cache: ${errorMessage}`);
    }
}

/**
 * Check if a component has already been generated
 * @param cache - The code cache object
 * @param nodeId - The unique node ID to check
 */
export function isComponentGenerated(cache: CodeCache, nodeId: string): boolean {
    return cache.generatedComponents.includes(nodeId);
}

/**
 * Mark a component as generated
 * @param cache - The code cache object
 * @param nodeId - The unique node ID to mark as generated
 */
export function markComponentGenerated(cache: CodeCache, nodeId: string): void {
    if (!isComponentGenerated(cache, nodeId)) {
        cache.generatedComponents.push(nodeId);
    }
}

/**
 * Mark a component as generated and save cache immediately
 * Combines markComponentGenerated and saveCodeCache for convenience
 * @param cache - The code cache object
 * @param nodeId - The unique node ID to mark as generated
 * @param workspace - The workspace structure containing cache file path
 */
export function saveComponentGenerated(cache: CodeCache, nodeId: string, workspace: WorkspaceStructure): void {
    markComponentGenerated(cache, nodeId);
    saveCodeCache(workspace, cache);
}

/**
 * Check if root component has been injected into App.tsx
 */
export function isAppInjected(cache: CodeCache): boolean {
    return cache.appInjected;
}

/**
 * Mark App.tsx as injected
 */
export function markAppInjected(cache: CodeCache): void {
    cache.appInjected = true;
}

/**
 * Mark App.tsx as injected and save cache immediately
 * Combines markAppInjected and saveCodeCache for convenience
 */
export function saveAppInjected(cache: CodeCache, workspace: WorkspaceStructure): void {
    markAppInjected(cache);
    saveCodeCache(workspace, cache);
}

/**
 * Create an empty cache
 */
function createEmptyCache(): CodeCache {
    return {
        generatedComponents: [],
        appInjected: false,
    };
}
