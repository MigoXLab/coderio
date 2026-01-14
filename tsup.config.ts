import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

// Read version from package.json at build time
const pkg = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
    entry: ['src/index.ts', 'src/cli/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    shims: true,
    minify: false,
    target: 'node18',
    outDir: 'dist',
    // Inject version at build time
    define: {
        __VERSION__: JSON.stringify(pkg.version),
    },
});
