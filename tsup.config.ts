import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

// Read version from package.json at build time
const pkg = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        cli: 'src/cli/index.ts',
    },
    // Use ESM - modern Node.js (18+) handles mixed CJS/ESM well
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    target: 'node18',
    outDir: 'dist',
    // Use esbuild's platform setting for better Node.js compatibility
    platform: 'node',
    // Mark problematic CJS packages as external to avoid bundling issues
    external: [
        /^@langchain\//,  // Don't bundle langchain packages
        'openai',         // OpenAI SDK (has form-data issues)
        'axios',
        'form-data',
        'combined-stream',
    ],
    // Inject version at build time
    define: {
        __VERSION__: JSON.stringify(pkg.version),
    },
});
