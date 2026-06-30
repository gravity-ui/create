import baseConfig from '@gravity-ui/eslint-config';
import importOrderConfig from '@gravity-ui/eslint-config/import-order';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig(
    globalIgnores(['./lib/**'], 'Generated package content'),
    baseConfig,
    importOrderConfig,
    {
        files: ['./src/**/*'],
        ignores: ['./src/utils/fs.ts', './src/cli/version.ts'],
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
