import type {CapturedFile, FileSystem} from './types.js';

export interface MemFs extends FileSystem {
    readonly files: readonly CapturedFile[];
}

export function isMemFs(fs: FileSystem): fs is MemFs {
    return 'files' in fs;
}

/**
 * In-memory filesystem that captures writes instead of executing them.
 * Used by --dry-run and by tests.
 */
export function createMemFs(): MemFs {
    const files: CapturedFile[] = [];
    return {
        files,
        async mkdir() {
            // no-op
        },
        async writeFile(p, content) {
            files.push({path: p, content});
        },
    };
}
