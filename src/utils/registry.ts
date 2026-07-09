import {DEFAULT_NPM_REGISTRY} from './constants.js';

export function isDefaultRegistry(registry: string): boolean {
    return registry.replace(/\/+$/, '') === DEFAULT_NPM_REGISTRY.replace(/\/+$/, '');
}
