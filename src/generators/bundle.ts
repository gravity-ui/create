import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {frontendFlags} from '../utils/frontendFlags.js';
import {addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderIndexJs from './templates/index.js.hbs.js';
import renderSrcIndexTs from './templates/src/index.ts.hbs.js';

export async function generateBundling(model: ProjectModel, fs: FileSystem) {
    const hasAppBuilder = model.hasBackend || frontendFlags(model).hasFrontend;

    if (hasAppBuilder) {
        return;
    }

    if (model.language === 'ts') {
        addScript(model, 'start', 'node dist/index.js');
        addScript(model, 'dev', 'tsc --watch');
        addScript(model, 'build', 'tsc -p tsconfig.build.json');

        await fs.writeFile(path.join(model.destination, 'src', 'index.ts'), renderSrcIndexTs({}));
    } else if (model.language === 'js') {
        addScript(model, 'start', 'node index.js');

        await fs.writeFile(path.join(model.destination, 'index.js'), renderIndexJs({}));
    }
}
