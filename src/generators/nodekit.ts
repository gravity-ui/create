import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {getDefaultEntryFileName} from '../utils/getDefaultEntryFileName.js';
import {addDep} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

import renderServerIndexJs from './templates/src/server/index.js.hbs.js';
import renderServerIndexTs from './templates/src/server/index.ts.hbs.js';

export async function generateNodekit(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!model.hasBackend) {
        return;
    }

    addDep(model, '@gravity-ui/nodekit', '^2.0.0');
    addDep(model, '@gravity-ui/expresskit', '^3.0.0');

    if (model.hasFrontend) {
        addDep(model, '@gravity-ui/app-layout', '^2.0.0');
        addDep(model, 'express', '^4.0.0');
    }

    const isTs = model.language === 'ts';
    const serverFile = path.join(model.destination, 'src', 'server', `index.${isTs ? 'ts' : 'js'}`);
    const render = isTs ? renderServerIndexTs : renderServerIndexJs;

    await fs.writeFile(
        serverFile,
        render({
            hasFrontend: model.hasFrontend,
            projectName: model.projectName,
            entryFileName: getDefaultEntryFileName(model.projectName),
        }),
    );
}
