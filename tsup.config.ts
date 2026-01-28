import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

// Read version from package.json at build time
const pkg = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        cli: 'src/cli/index.ts',
    },
    // Use ESM format with proper CJS interop
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    target: 'node18',
    outDir: 'dist',
    platform: 'node',
    // All dependencies are external by default (automatic)
    // Explicitly list only special cases for documentation purposes
    external: [
        /^@langchain\//, // Scoped package with many submodules
    ],
    // Inject version at build time
    define: {
        __VERSION__: JSON.stringify(pkg.version),
    },
});
