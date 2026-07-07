import type {ProjectModel} from '../model/types.js';

export function frontendFlags(model: ProjectModel) {
    const features = model.frontend;

    return {
        hasFrontend: features !== false,
        hasStyles: features !== false && features.includes('styles'),
        hasReact: features !== false && features.includes('react'),
    };
}
