import type {CapturedFile, FileSystem} from './types.js';

export interface MemFs extends FileSystem {
    readonly files: readonly CapturedFile[];
}

/**
 * In-memory filesystem that captures writes instead of executing them.
 * Used by --dry-run and by tests.
 */
export function createMemFs(): MemFs {
    const files: CapturedFile[] = [];
    const seen = new Set<string>();
    return {
        files,
        async writeFile(p, content) {
            if (seen.has(p)) {
                throw new Error(`Duplicate write: ${p}`);
            }
            seen.add(p);
            files.push({path: p, content});
        },
    };
}
