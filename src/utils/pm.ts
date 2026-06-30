import type {ProjectModel} from '../model/index.js';

export function addDep(model: ProjectModel, name: string, version: string): void {
    model.packages.dependencies[name] = version;
}

export function addDevDep(model: ProjectModel, name: string, version: string): void {
    model.packages.devDependencies[name] = version;
}

export function addScript(model: ProjectModel, name: string, command: string): void {
    model.scripts[name] = command;
}
