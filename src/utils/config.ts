import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import yaml from 'js-yaml';

// Configuration directory in user's home
const CONFIG_DIR = resolve(homedir(), '.coderio');
const CONFIG_FILE = resolve(CONFIG_DIR, 'config.yaml');

/**
 * Model configuration interface
 */
export interface ModelConfig {
    provider: string;
    model: string;
    baseUrl: string;
    apiKey: string;
}

/**
 * Figma configuration interface
 */
export interface FigmaConfig {
    token: string;
}

/**
 * Configuration file structure
 */
interface Config {
    model: ModelConfig;
    figma: FigmaConfig;
}

// Cache for loaded configuration
let cachedConfig: Config | null = null;

/**
 * Load configuration from user's config directory
 * The configuration is cached after first load
 * @returns Full configuration object
 */
export function loadConfig(): Config {
    if (cachedConfig) {
        return cachedConfig;
    }

    if (!existsSync(CONFIG_FILE)) {
        throw new Error(`Configuration file not found at: ${CONFIG_FILE}\n` + `Please create the configuration file.`);
    }

    try {
        const fileContent = readFileSync(CONFIG_FILE, 'utf8');
        const rawConfig = yaml.load(fileContent) as Config;

        if (!rawConfig) {
            throw new Error('Invalid config.yaml structure: configuration is empty');
        }

        cachedConfig = rawConfig;
        return cachedConfig;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config.yaml: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Get model configuration from config.yaml
 * @returns Model configuration
 * @throws Error if configuration is invalid
 */
export function getModelConfig(): ModelConfig {
    const config = loadConfig();
    if (!config.model) {
        throw new Error('Model configuration not found in config.yaml');
    }
    return config.model;
}

/**
 * Get Figma configuration from config.yaml
 * @returns Figma configuration
 * @throws Error if configuration is invalid
 */
export function getFigmaConfig(): FigmaConfig {
    const config = loadConfig();
    if (!config.figma) {
        throw new Error('Figma configuration not found in config.yaml');
    }
    return config.figma;
}

/**
 * Get the path to the configuration file
 */
export function getConfigPath(): string {
    return CONFIG_FILE;
}

/**
 * Check if configuration file exists
 */
export function configExists(): boolean {
    return existsSync(CONFIG_FILE);
}
/**
 * Clear the configuration cache
 * Useful for testing or when configuration needs to be reloaded
 */
export function clearConfigCache(): void {
    cachedConfig = null;
}
