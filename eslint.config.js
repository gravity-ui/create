import baseConfig from '@gravity-ui/eslint-config';
import importOrderConfig from '@gravity-ui/eslint-config/import-order';
import {defineConfig, globalIgnores} from 'eslint/config';
import node from 'eslint-plugin-n';

export default defineConfig(
    globalIgnores(
        ['./lib/**', './src/generators/templates/**/*.hbs.ts'],
        'Generated package content',
    ),
    baseConfig,
    importOrderConfig,
    {
        plugins: {
            n: node,
        },
        extends: ['n/recommended-module'],
        files: ['./src/**/*'],
        ignores: ['./src/**/__fixtures__/**/*', './src/**/*.test.ts'],
    },
    {
        plugins: {
            n: node,
        },
        extends: ['n/recommended-module'],
        files: ['./src/**/__fixtures__/**/*', './src/**/*.test.ts'],
        settings: {
            node: {
                version: '^24',
            },
        },
    },
    {
        files: ['./src/**/*'],
        ignores: ['./src/utils/fs.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'node:fs',
                            message: 'Use the FileSystem parameter instead of node:fs directly.',
                        },
                        {
                            name: 'node:fs/promises',
                            message:
                                'Use the FileSystem parameter instead of node:fs/promises directly.',
                        },
                        {name: 'fs', message: 'Use node: prefix and the FileSystem parameter.'},
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    fixStyle: 'inline-type-imports',
                    disallowTypeAnnotations: false,
                },
            ],
            // To avoid imports split from `@typescript-eslint/consistent-type-imports` auto-fix
            '@typescript-eslint/no-import-type-side-effects': 'error',
        },
    },
);
