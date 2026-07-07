import path from 'node:path';

import {pathExists} from './fs.js';
import {isKebabCase} from './kebabCase.js';

/**
 * Validates a destination folder before any files are written: its name
 * must be kebab-case, it must resolve inside cwd (never write to some
 * unrelated location on disk), and it must not already exist (never
 * clobber an existing folder).
 */
export function validateDestination(cwd: string, input: string | undefined): string | undefined {
    if (!input || input.trim().length === 0) {
        return 'Folder is required';
    }

    const resolved = path.resolve(cwd, input);

    if (!isKebabCase(path.basename(resolved))) {
        return 'Destination folder name must be kebab-case';
    }

    const rel = path.relative(cwd, resolved);
    if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
        return 'Destination must be inside the current directory';
    }

    if (pathExists(resolved)) {
        return 'Destination folder already exists';
    }

    return undefined;
}
