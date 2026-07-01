import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {writeJson} from '../utils/fs.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateTypeScript(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (model.language !== 'ts') {
        return;
    }

    addDevDep(model, 'typescript', '^5.3.0');
    addDevDep(model, '@gravity-ui/tsconfig', '^1.0.0');

    if (!model.hasFrontend && !model.hasBackend) {
        addScript(model, 'typecheck', 'tsc --noEmit');

        const tsconfig: Record<string, unknown> = {
            extends: '@gravity-ui/tsconfig/tsconfig.json',
            compilerOptions: {
                outDir: './dist',
                rootDir: './src',
            },
            include: ['src/**/*'],
        };

        if (model.hasReact) {
            (tsconfig.compilerOptions as Record<string, unknown>).jsx = 'react-jsx';
        }

        await writeJson(fs, path.join(model.destination, 'tsconfig.json'), tsconfig);
        return;
    }

    addScript(model, 'typecheck', 'tsc -b');

    const references: Array<{path: string}> = [];

    if (model.hasFrontend) {
        const uiTsconfig: Record<string, unknown> = {
            extends: '@gravity-ui/tsconfig/tsconfig.json',
            compilerOptions: {
                composite: true,
                outDir: '../../dist/ui',
                rootDir: '.',
            },
            include: ['**/*'],
        };

        if (model.hasReact) {
            (uiTsconfig.compilerOptions as Record<string, unknown>).jsx = 'react-jsx';
        }

        await writeJson(fs, path.join(model.destination, 'src/ui/tsconfig.json'), uiTsconfig);
        references.push({path: './src/ui'});
    }

    if (model.hasBackend) {
        const serverTsconfig: Record<string, unknown> = {
            extends: '@gravity-ui/tsconfig/tsconfig.json',
            compilerOptions: {
                composite: true,
                outDir: '../../dist/server',
                rootDir: '.',
            },
            include: ['**/*'],
        };

        await writeJson(fs, path.join(model.destination, 'src/server/tsconfig.json'), serverTsconfig);
        references.push({path: './src/server'});
    }

    await writeJson(fs, path.join(model.destination, 'tsconfig.json'), {
        files: [],
        references,
    });
}
