import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {writeJson} from '../utils/fs.js';
import {isModulePackage} from '../utils/isModulePackage.js';
import {isDefaultRegistry} from '../utils/registry.js';
import type {FileSystem} from '../utils/types.js';

import renderGitignore from './templates/.gitignore.hbs.js';
import renderNpmrc from './templates/.npmrc.hbs.js';
import renderReadme from './templates/README.md.hbs.js';

function sortKeys(record: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

export async function generateBase(model: ProjectModel, fs: FileSystem): Promise<void> {
    const isModule = isModulePackage(model);

    const pkg: Record<string, unknown> = {
        name: model.projectName,
        version: '0.0.0',
        private: true,
        ...(isModule ? {type: 'module'} : {}),
        scripts: model.scripts,
        dependencies: sortKeys(model.packages.dependencies),
        devDependencies: sortKeys(model.packages.devDependencies),
    };

    await writeJson(fs, path.join(model.destination, 'package.json'), pkg);

    await fs.writeFile(path.join(model.destination, '.gitignore'), renderGitignore({}));

    await fs.writeFile(
        path.join(model.destination, 'README.md'),
        renderReadme({projectName: model.projectName}),
    );

    if (model.registry && !isDefaultRegistry(model.registry)) {
        await fs.writeFile(
            path.join(model.destination, '.npmrc'),
            renderNpmrc({registry: model.registry}),
        );
    }
}
