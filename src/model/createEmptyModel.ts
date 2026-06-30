import type {ProjectModel} from './types.js';

export function createEmptyModel(): ProjectModel {
    return {
        destination: '',
        projectName: '',
        language: 'ts',
        hasFrontend: false,
        hasStyles: false,
        hasReact: false,
        hasBackend: false,
        packages: {dependencies: {}, devDependencies: {}},
        scripts: {},
    };
}
