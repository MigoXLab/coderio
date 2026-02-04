import { defineConfig } from 'tsup';
import { readFileSync, cpSync, existsSync } from 'fs';

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
    // Copy report template to dist after build
    onSuccess: async () => {
        const templateSrc = 'src/tools/report-tool/template/dist';
        const templateDest = 'dist/tools/report-tool/template';

        if (existsSync(templateSrc)) {
            console.log(`\nCopying report template from ${templateSrc} to ${templateDest}...`);
            cpSync(templateSrc, templateDest, { recursive: true });
            console.log('✓ Report template copied successfully');
        } else {
            console.warn(`⚠ Warning: Report template source not found at ${templateSrc}`);
            console.warn('  Run "pnpm run build:report" first to build the template');
        }
    },
});
