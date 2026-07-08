import type {ProjectModel} from '../model/types.js';

import {calculateFlags} from './calculateFlags.js';

export function isModulePackage(model: ProjectModel) {
    return !model.hasBackend && !calculateFlags(model).hasFrontend;
}
