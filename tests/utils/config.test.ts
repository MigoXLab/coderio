import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

describe('config utilities', () => {
    const fakeHome = '/home/tester';
    const expectedConfigPath = path.resolve(fakeHome, '.coderio', 'config.yaml');

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unmock('fs');
        vi.unmock('os');
        vi.unmock('js-yaml');
    });

    async function importConfigModuleWithMocks({
        exists = true,
        fileContent = 'model: {}\nfigma: {}\n',
        parsedYaml = { model: { provider: 'x', model: 'y', baseUrl: 'z', apiKey: 'k' }, figma: { token: 't' } },
        yamlThrows,
    }: {
        exists?: boolean;
        fileContent?: string;
        parsedYaml?: any;
        yamlThrows?: Error;
    }) {
        const existsSync = vi.fn(() => exists);
        const readFileSync = vi.fn(() => fileContent);

        const yamlLoad = vi.fn(() => parsedYaml);
        if (yamlThrows) {
            yamlLoad.mockImplementation(() => {
                throw yamlThrows;
            });
        }

        vi.doMock('os', () => ({
            homedir: () => fakeHome,
        }));
        vi.doMock('fs', () => ({
            existsSync,
            readFileSync,
        }));
        vi.doMock('js-yaml', () => ({
            default: {
                load: yamlLoad,
            },
        }));

        const mod = await import('../../src/utils/config');
        return { mod, existsSync, readFileSync, yamlLoad };
    }

    it('should expose deterministic config path under homedir', async () => {
        const { mod } = await importConfigModuleWithMocks({});
        expect(mod.CONFIG_DIR).toBe(path.resolve(fakeHome, '.coderio'));
        expect(mod.getConfigPath()).toBe(expectedConfigPath);
    });

    it('should throw when config file does not exist', async () => {
        const { mod } = await importConfigModuleWithMocks({ exists: false });
        expect(() => mod.loadConfig()).toThrowError(new RegExp(`Configuration file not found at: ${expectedConfigPath}`));
    });

    it('should throw when yaml parses to empty', async () => {
        const { mod } = await importConfigModuleWithMocks({ parsedYaml: null });
        expect(() => mod.loadConfig()).toThrowError(/Invalid config\.yaml structure: configuration is empty/);
    });

    it('should wrap yaml parsing errors with helpful message', async () => {
        const { mod } = await importConfigModuleWithMocks({ yamlThrows: new Error('boom') });
        expect(() => mod.loadConfig()).toThrowError(/Failed to load config\.yaml: boom/);
    });

    it('should cache loaded config', async () => {
        const { mod, readFileSync, yamlLoad } = await importConfigModuleWithMocks({});

        const first = mod.loadConfig();
        const second = mod.loadConfig();

        expect(first).toBe(second);
        expect(readFileSync).toHaveBeenCalledTimes(1);
        expect(yamlLoad).toHaveBeenCalledTimes(1);
    });

    it('should clear cache and reload after clearConfigCache', async () => {
        const { mod, readFileSync, yamlLoad } = await importConfigModuleWithMocks({});

        mod.loadConfig();
        mod.clearConfigCache();
        mod.loadConfig();

        expect(readFileSync).toHaveBeenCalledTimes(2);
        expect(yamlLoad).toHaveBeenCalledTimes(2);
    });

    it('should return model and figma config via helpers', async () => {
        const parsedYaml = {
            model: { provider: 'openai', model: 'gpt-4.1', baseUrl: 'https://example.com', apiKey: 'secret' },
            figma: { token: 'figma-token' },
            debug: { enabled: true, outputDir: '/tmp/debug' },
        };
        const { mod } = await importConfigModuleWithMocks({ parsedYaml });

        expect(mod.getModelConfig()).toEqual(parsedYaml.model);
        expect(mod.getFigmaConfig()).toEqual(parsedYaml.figma);
        expect(mod.getDebugConfig()).toEqual(parsedYaml.debug);
    });

    it('should default debug config to disabled', async () => {
        const parsedYaml = {
            model: { provider: 'x', model: 'y', baseUrl: 'z', apiKey: 'k' },
            figma: { token: 't' },
        };
        const { mod } = await importConfigModuleWithMocks({ parsedYaml });

        expect(mod.getDebugConfig()).toEqual({ enabled: false });
    });
});
