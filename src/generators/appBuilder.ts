import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {calculateFlags} from '../utils/calculateFlags.js';
import {getDefaultEntryFileName} from '../utils/getDefaultEntryFileName.js';
import {addDep, addDevDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderAppBuilderConfigJs from './templates/app-builder.config.js.hbs.js';
import renderAppBuilderConfigTs from './templates/app-builder.config.ts.hbs.js';
import renderAppJsx from './templates/src/ui/components/App/App.jsx.hbs.js';
import renderAppTsx from './templates/src/ui/components/App/App.tsx.hbs.js';
import renderComponentsIndexJs from './templates/src/ui/components/index.js.hbs.js';
import renderComponentsIndexTs from './templates/src/ui/components/index.ts.hbs.js';
import renderEntryJs from './templates/src/ui/entries/entry.js.hbs.js';
import renderEntryJsx from './templates/src/ui/entries/entry.jsx.hbs.js';
import renderEntryTs from './templates/src/ui/entries/entry.ts.hbs.js';
import renderEntryTsx from './templates/src/ui/entries/entry.tsx.hbs.js';

export async function generateAppBuilder(model: ProjectModel, fs: FileSystem): Promise<void> {
    const {hasFrontend, hasReact, hasAppBuilder} = calculateFlags(model);

    if (!hasAppBuilder) {
        return;
    }

    let target = '';

    if (model.hasBackend && !hasFrontend) {
        target = ' --target server';
    } else if (hasFrontend && !model.hasBackend) {
        target = ' --target client';
    }

    addDevDep(model, '@gravity-ui/app-builder', '^0.49.0');

    if (model.hasBackend) {
        addScript(model, 'start', 'node dist/server/index.js');
    }

    addScript(model, 'dev', `app-builder dev${target}`);
    addScript(model, 'build', `NODE_ENV=production app-builder build${target}`);

    const appBuilderConfigOptions = {
        hasReact,
        hasFrontend,
        hasBackend: model.hasBackend,
    };

    await fs.writeFile(
        path.join(model.destination, `app-builder.config.${model.language === 'ts' ? 'ts' : 'js'}`),
        model.language === 'ts'
            ? renderAppBuilderConfigTs(appBuilderConfigOptions)
            : renderAppBuilderConfigJs(appBuilderConfigOptions),
    );

    const isTs = model.language === 'ts';
    const uiDir = path.join(model.destination, 'src', 'ui');

    if (hasReact) {
        await writeReactFiles(model, fs, uiDir, isTs);
    }

    if (hasFrontend) {
        await writeEntryFile(model, fs, uiDir, isTs, hasReact);
    }
}

async function writeReactFiles(
    model: ProjectModel,
    fs: FileSystem,
    uiDir: string,
    isTs: boolean,
): Promise<void> {
    const jsxExt = isTs ? 'tsx' : 'jsx';
    const fileExt = isTs ? 'ts' : 'js';

    addDep(model, 'react', '^18.0.0');
    addDep(model, 'react-dom', '^18.0.0');
    addDep(model, '@gravity-ui/uikit', '^7.0.0');

    if (isTs) {
        addDevDep(model, '@types/react', '^18.0.0');
        addDevDep(model, '@types/react-dom', '^18.0.0');
    }

    const appFile = path.join(uiDir, 'components', 'App', `App.${jsxExt}`);
    await fs.writeFile(appFile, isTs ? renderAppTsx({}) : renderAppJsx({}));

    const barrelFile = path.join(uiDir, 'components', `index.${fileExt}`);
    await fs.writeFile(
        barrelFile,
        isTs ? renderComponentsIndexTs({}) : renderComponentsIndexJs({}),
    );
}

async function writeEntryFile(
    model: ProjectModel,
    fs: FileSystem,
    uiDir: string,
    isTs: boolean,
    hasReact: boolean,
): Promise<void> {
    const jsxExt = isTs ? 'tsx' : 'jsx';
    const fileExt = isTs ? 'ts' : 'js';
    const entryFileOptions = {hasReact};
    const entryFile = path.join(
        uiDir,
        'entries',
        `${getDefaultEntryFileName(model.projectName)}.${hasReact ? jsxExt : fileExt}`,
    );

    let template = isTs ? renderEntryTs(entryFileOptions) : renderEntryJs(entryFileOptions);

    if (hasReact) {
        template = isTs ? renderEntryTsx(entryFileOptions) : renderEntryJsx(entryFileOptions);
    }

    await fs.writeFile(entryFile, template);
}
