import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {writeJson} from '../utils/fs.js';
import type {FileSystem} from '../utils/types.js';

export async function generateBase(model: ProjectModel, fs: FileSystem): Promise<void> {
    const pkg: Record<string, unknown> = {
        name: model.projectName,
        version: '0.0.0',
        private: true,
        scripts: model.scripts,
        dependencies: model.packages.dependencies,
        devDependencies: model.packages.devDependencies,
    };

    await writeJson(fs, path.join(model.destination, 'package.json'), pkg);

    await fs.writeFile(
        path.join(model.destination, '.gitignore'),
        ['node_modules', 'dist', 'build', '.env', '.DS_Store', ''].join('\n'),
    );

    await fs.writeFile(
        path.join(model.destination, 'README.md'),
        `# ${model.projectName}\n\nBootstrapped with @gravity-ui/create.\n`,
    );

    if (model.registry) {
        await fs.writeFile(path.join(model.destination, '.npmrc'), `registry=${model.registry}\n`);
    }
}
