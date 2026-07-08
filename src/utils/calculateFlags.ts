import type {ProjectModel} from '../model/types.js';

export function calculateFlags(model: ProjectModel) {
    const features = model.frontend;
    const hasFrontend = features !== false;

    return {
        hasFrontend,
        hasStyles: features !== false && features.includes('styles'),
        hasReact: features !== false && features.includes('react'),
        hasAppBuilder: model.hasBackend || hasFrontend,
    };
}
