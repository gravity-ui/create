import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import type {CapturedFile, FileSystem} from './types.js';

/**
 * Only this file is allowed to touch node:fs directly (see eslint.config.js).
 * Used by destination validation to refuse to write into a folder that's
 * already there.
 */
export function pathExists(target: string): boolean {
    return existsSync(target);
}

/**
 * Writes captured files to the real filesystem in parallel. Generators
 * always write through an in-memory FileSystem first; this is the only
 * place that touches node:fs/promises directly.
 */
export async function flushFiles(files: readonly CapturedFile[]): Promise<void> {
    const allDirs = new Set(files.map((f) => path.dirname(f.path)));
    // mkdir(recursive) already creates ancestors, so only the deepest dir
    // per branch needs an explicit call.
    const leafDirs = [...allDirs].filter(
        (dir) => ![...allDirs].some((other) => other !== dir && other.startsWith(dir + path.sep)),
    );

    await Promise.all(leafDirs.map((d) => fs.mkdir(d, {recursive: true})));
    await Promise.all(files.map((f) => fs.writeFile(f.path, f.content, 'utf8')));
}

/**
 * Helper: write a JS value as a JSON file. Generators use this via the
 * passed-in FileSystem rather than the real fs directly.
 */
export async function writeJson(fs: FileSystem, filePath: string, data: unknown): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}
