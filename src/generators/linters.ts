import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {writeJson} from '../utils/fs.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderPrettierrc from './templates/.prettierrc.js.hbs.js';

export async function generateLinters(model: ProjectModel, fs: FileSystem): Promise<void> {
    addDevDep(model, 'eslint', '^8.57.0');
    addDevDep(model, 'prettier', '^3.2.0');
    addDevDep(model, '@gravity-ui/eslint-config', '^3.0.0');
    addDevDep(model, '@gravity-ui/prettier-config', '^1.1.0');

    addScript(model, 'lint', 'eslint . --ext .js,.jsx,.ts,.tsx');
    addScript(model, 'format', 'prettier --write .');

    const eslintExtends: string[] = ['@gravity-ui/eslint-config'];
    if (model.language === 'ts') {
        eslintExtends.push('@gravity-ui/eslint-config/typescript');
    }
    if (model.hasReact) {
        eslintExtends.push('@gravity-ui/eslint-config/client');
    }

    await writeJson(fs, path.join(model.destination, '.eslintrc.json'), {
        extends: eslintExtends,
    });

    await fs.writeFile(path.join(model.destination, '.prettierrc.js'), renderPrettierrc({}));
}
