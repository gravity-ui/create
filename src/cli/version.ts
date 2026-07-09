import pkg from '../../package.json' with {type: 'json'};

export function readVersion(): string {
    return pkg.version;
}
