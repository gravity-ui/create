import type {ProjectModel} from '../model/types.js';

export function isModulePackage(model: ProjectModel) {
    return !model.hasBackend && !model.hasFrontend;
}
