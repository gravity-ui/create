import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderAppBuilderConfigJs from './templates/app-builder.config.js.hbs.js';
import renderAppBuilderConfigTs from './templates/app-builder.config.ts.hbs.js';
import renderIndexJs from './templates/index.js.hbs.js';
import renderSrcIndexTs from './templates/src/index.ts.hbs.js';

export async function generateBundling(model: ProjectModel, fs: FileSystem) {
    const hasAppBuilder = model.hasBackend || model.hasFrontend;

    if (hasAppBuilder) {
        let target = '';

        if (model.hasBackend && !model.hasFrontend) {
            target = ' --target server';
        } else if (model.hasFrontend && !model.hasBackend) {
            target = ' --target client';
        }

        addDevDep(model, '@gravity-ui/app-builder', '^0.48.0');

        if (model.hasBackend) {
            addScript(model, 'start', 'node dist/server/index.js');
        }

        addScript(model, 'dev', `app-builder dev${target}`);
        addScript(model, 'build', `NODE_ENV=production app-builder build${target}`);

        const appBuilderConfigOptions = {
            hasReact: model.hasReact,
            hasFrontend: model.hasFrontend,
            hasBackend: model.hasBackend,
        };

        await fs.writeFile(
            path.join(
                model.destination,
                `app-builder.config.${model.language === 'ts' ? 'ts' : 'js'}`,
            ),
            model.language === 'ts'
                ? renderAppBuilderConfigTs(appBuilderConfigOptions)
                : renderAppBuilderConfigJs(appBuilderConfigOptions),
        );
    } else if (model.language === 'ts') {
        addScript(model, 'start', 'node dist/index.js');
        addScript(model, 'dev', 'tsc --watch');
        addScript(model, 'build', 'tsc -p tsconfig.build.json');

        await fs.writeFile(path.join(model.destination, 'src', 'index.ts'), renderSrcIndexTs({}));
    } else if (model.language === 'js') {
        addScript(model, 'start', 'node index.js');

        await fs.writeFile(path.join(model.destination, 'index.js'), renderIndexJs({}));
    }
}
