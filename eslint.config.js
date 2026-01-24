import tseslint from 'typescript-eslint';

export default [
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            'coderio/**',
            'scripts/**',
            'examples/**',
            'src/tools/report-tool/template/**',
            '*.config.ts',
            '*.config.js',
        ],
    },
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                __VERSION__: 'readonly',
            },
        },
        rules: {
            // TypeScript-specific rules
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // JavaScript rules
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
];
