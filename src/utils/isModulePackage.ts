import type {ProjectModel} from '../model/types.js';

import {frontendFlags} from './frontendFlags.js';

export function isModulePackage(model: ProjectModel) {
    return !model.hasBackend && !frontendFlags(model).hasFrontend;
}
