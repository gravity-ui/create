import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {getDefaultEntryFileName} from '../utils/getDefaultEntryFileName.js';
import {addDep, addDevDep} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderAppJsx from './templates/src/ui/components/App/App.jsx.hbs.js';
import renderAppTsx from './templates/src/ui/components/App/App.tsx.hbs.js';
import renderComponentsIndexJs from './templates/src/ui/components/index.js.hbs.js';
import renderComponentsIndexTs from './templates/src/ui/components/index.ts.hbs.js';
import renderEntryJsx from './templates/src/ui/entries/entry.jsx.hbs.js';
import renderEntryTsx from './templates/src/ui/entries/entry.tsx.hbs.js';

export async function generateReact(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!model.hasReact) {
        return;
    }

    addDep(model, 'react', '^18.0.0');
    addDep(model, 'react-dom', '^18.0.0');
    addDep(model, '@gravity-ui/uikit', '^7.0.0');

    if (model.language === 'ts') {
        addDevDep(model, '@types/react', '^18.0.0');
        addDevDep(model, '@types/react-dom', '^18.0.0');
    }

    const isTs = model.language === 'ts';
    const jsxExt = isTs ? 'tsx' : 'jsx';
    const fileExt = isTs ? 'ts' : 'js';
    const uiDir = path.join(model.destination, 'src', 'ui');

    const appFile = path.join(uiDir, 'components', 'App', `App.${jsxExt}`);
    await fs.writeFile(appFile, isTs ? renderAppTsx({}) : renderAppJsx({}));

    const barrelFile = path.join(uiDir, 'components', `index.${fileExt}`);
    await fs.writeFile(
        barrelFile,
        isTs ? renderComponentsIndexTs({}) : renderComponentsIndexJs({}),
    );

    const entryFile = path.join(
        uiDir,
        'entries',
        `${getDefaultEntryFileName(model.projectName)}.${jsxExt}`,
    );
    await fs.writeFile(entryFile, isTs ? renderEntryTsx({}) : renderEntryJsx({}));
}
