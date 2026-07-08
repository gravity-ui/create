import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {frontendFlags} from '../utils/frontendFlags.js';
import {isModulePackage} from '../utils/isModulePackage.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderPrettierrc from './templates/.prettierrc.js.hbs.js';
import renderEslintConfig from './templates/eslint.config.js.hbs.js';

export async function generateLinters(model: ProjectModel, fs: FileSystem): Promise<void> {
    const isModule = isModulePackage(model);
    const {hasFrontend} = frontendFlags(model);

    addDevDep(model, 'eslint', '^9.0.0');
    addDevDep(model, 'prettier', '^3.0.0');
    addDevDep(model, '@gravity-ui/eslint-config', '^4.0.0');
    addDevDep(model, '@gravity-ui/prettier-config', '^1.0.0');
    addDevDep(model, 'globals', '^17.0.0');

    addScript(model, 'lint', 'eslint');
    addScript(model, 'prettier', 'prettier --list-different .');

    await fs.writeFile(
        path.join(model.destination, `eslint.config.${isModule ? 'js' : 'mjs'}`),
        renderEslintConfig({
            isModule,
            hasTypescript: model.language === 'ts',
            hasFrontend,
            hasBackend: model.hasBackend,
        }),
    );

    await fs.writeFile(
        path.join(model.destination, `.prettierrc.${isModule ? 'cjs' : 'js'}`),
        renderPrettierrc({}),
    );
}
