import type {ProjectModel} from '../model/index.js';
import {addDevDep, addScript} from '../utils/pm.js';

export function generateBundling(model: ProjectModel) {
    const hasAppBuilder = model.hasBackend || model.hasFrontend;

    if (hasAppBuilder) {
        addDevDep(model, '@gravity-ui/app-builder', '^0.48.0');
        addScript(model, 'start', 'node dist/server/index.js');
        addScript(model, 'dev', 'app-builder dev');
        addScript(model, 'build', 'NODE_ENV=production app-builder build');
    } else if (model.language === 'ts') {
        addScript(model, 'start', 'node dist/index.js');
        addScript(model, 'dev', 'tsc --watch');
        addScript(model, 'build', 'tsc -p tsconfg.build.json');
    }
}
