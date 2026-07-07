import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {frontendFlags} from '../utils/frontendFlags.js';
import {writeJson} from '../utils/fs.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateTypeScript(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (model.language !== 'ts') {
        return;
    }

    const {hasFrontend, hasReact} = frontendFlags(model);

    addDevDep(model, 'typescript', '^5.3.0');
    addDevDep(model, '@gravity-ui/tsconfig', '^1.0.0');

    if (!hasFrontend && !model.hasBackend) {
        addScript(model, 'typecheck', 'tsc --noEmit');

        const tsconfig: Record<string, unknown> = {
            extends: '@gravity-ui/tsconfig/tsconfig.json',
            compilerOptions: {
                target: 'ES2022',
                module: 'NodeNext',
                moduleResolution: 'NodeNext',
                outDir: './dist',
                rootDir: './src',
            },
            include: ['src/**/*'],
        };

        await writeJson(fs, path.join(model.destination, 'tsconfig.json'), tsconfig);

        const buildTsconfig: Record<string, unknown> = {
            extends: './tsconfig.json',
            compilerOptions: {
                declaration: true,
            },
        };

        await writeJson(fs, path.join(model.destination, 'tsconfig.build.json'), buildTsconfig);

        return;
    }

    addScript(model, 'typecheck', 'tsc -b');

    const references: Array<{path: string}> = [];

    if (hasFrontend) {
        const uiTsconfig: Record<string, unknown> = {
            extends: '@gravity-ui/tsconfig/tsconfig.json',
            compilerOptions: {
                composite: true,
                outDir: '../../dist/ui',
                rootDir: '.',
            },
            include: ['**/*'],
        };

        if (hasReact) {
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

        await writeJson(
            fs,
            path.join(model.destination, 'src/server/tsconfig.json'),
            serverTsconfig,
        );
        references.push({path: './src/server'});
    }

    await writeJson(fs, path.join(model.destination, 'tsconfig.json'), {
        files: [],
        references,
    });
}
