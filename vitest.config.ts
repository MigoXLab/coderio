import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: [
                // Only include files that have tests
                'src/utils/naming.ts',
                'src/utils/parser.ts',
                'src/utils/url-parser.ts',
                'src/utils/promise-pool.ts',
                'src/tools/style-tool/color.ts',
                'src/tools/position-tool/utils/position-metrics.ts',
                'src/nodes/validation/utils/tree/tree-traversal.ts',
            ],
            exclude: [
                'node_modules/',
                'dist/',
                'tests/',
                'coderio/',
                'src/tools/report-tool/template/',
                '**/*.d.ts',
                '**/*.config.ts',
                '**/*.config.js',
                'src/cli/',
                'src/env.d.ts',
            ],
        },
    },
});
