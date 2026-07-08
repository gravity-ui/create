import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {calculateFlags} from '../utils/calculateFlags.js';
import {writeJson} from '../utils/fs.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateStylelint(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!calculateFlags(model).hasStyles) {
        return;
    }

    addDevDep(model, 'stylelint', '^16.0.0');
    addDevDep(model, '@gravity-ui/stylelint-config', '^5.0.0');
    addScript(model, 'lint:styles', 'stylelint "**/*.scss"');

    await writeJson(fs, path.join(model.destination, '.stylelintrc.json'), {
        extends: [
            '@gravity-ui/stylelint-config',
            '@gravity-ui/stylelint-config/order',
            '@gravity-ui/stylelint-config/prettier',
        ],
    });
}
