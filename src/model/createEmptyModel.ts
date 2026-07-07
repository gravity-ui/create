import type {ProjectModel} from './types.js';

export function createEmptyModel(): ProjectModel {
    return {
        destination: '',
        projectName: '',
        language: 'ts',
        frontend: false,
        hasBackend: false,
        packages: {dependencies: {}, devDependencies: {}},
        scripts: {},
    };
}
