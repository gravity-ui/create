import path from 'node:path';

import {pathExists, toRealPath} from './fs.js';
import {isKebabCase} from './kebabCase.js';

export type ValidateDestinationOptions = {
    /** Skip the already-exists check — safe for --dry-run, which writes nothing. */
    allowExisting?: boolean;
};

/**
 * Validates a destination folder before any files are written: its name
 * must be kebab-case, it must resolve inside cwd (never write to some
 * unrelated location on disk, even via a symlink planted inside cwd), and
 * it must not already exist (never clobber an existing folder) unless
 * `allowExisting` is set.
 */
export function validateDestination(
    cwd: string,
    input: string | undefined,
    options: ValidateDestinationOptions = {},
): string | undefined {
    if (!input || input.trim().length === 0) {
        return 'Folder is required';
    }

    const resolved = path.resolve(cwd, input);

    const rel = path.relative(toRealPath(cwd), toRealPath(resolved));
    if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
        return 'Destination must be inside the current directory';
    }

    if (!isKebabCase(path.basename(resolved))) {
        return 'Destination folder name must be kebab-case';
    }
    if (!options.allowExisting && pathExists(resolved)) {
        return 'Destination folder already exists';
    }

    return undefined;
}
