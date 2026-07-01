import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderAppBuilderConfigJs from './templates/app-builder.config.js.hbs.js';
import renderAppBuilderConfigTs from './templates/app-builder.config.ts.hbs.js';

export function generateBundling(model: ProjectModel, fs: FileSystem) {
    const hasAppBuilder = model.hasBackend || model.hasFrontend;

    if (hasAppBuilder) {
        addDevDep(model, '@gravity-ui/app-builder', '^0.48.0');
        addScript(model, 'start', 'node dist/server/index.js');
        addScript(model, 'dev', 'app-builder dev');
        addScript(model, 'build', 'NODE_ENV=production app-builder build');

        if (model.hasReact) {
            if (model.language === 'ts') {
                fs.writeFile(
                    path.join(model.destination, 'app-builder.config.ts'),
                    renderAppBuilderConfigTs({}),
                );
            } else {
                fs.writeFile(
                    path.join(model.destination, 'app-builder.config.js'),
                    renderAppBuilderConfigJs({}),
                );
            }
        }
    } else if (model.language === 'ts') {
        addScript(model, 'start', 'node dist/index.js');
        addScript(model, 'dev', 'tsc --watch');
        addScript(model, 'build', 'tsc -p tsconfg.build.json');
    }
}
