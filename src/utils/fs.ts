import fs from 'node:fs/promises';
import path from 'node:path';

import type {FileSystem} from './types.js';

/**
 * The real filesystem implementation. The only place in the codebase
 * allowed to import node:fs/promises directly.
 */
export const realFs: FileSystem = {
    async mkdir(p, opts) {
        await fs.mkdir(p, opts);
    },
    async writeFile(p, content) {
        await fs.mkdir(path.dirname(p), {recursive: true});
        await fs.writeFile(p, content, 'utf8');
    },
};

/**
 * Helper: write a JS value as a JSON file. Generators use this via the
 * passed-in FileSystem rather than the real fs directly.
 */
export async function writeJson(fs: FileSystem, filePath: string, data: unknown): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}
