/**
 * Minimal filesystem interface used by generators.
 *
 * Both the real filesystem (realFs) and the in-memory capture (createMemFs)
 * implement this. Generators depend only on this interface, never on node:fs
 * directly.
 */
export interface FileSystem {
    mkdir(path: string, opts?: {recursive?: boolean}): Promise<void>;
    writeFile(path: string, content: string): Promise<void>;
}

export interface CapturedFile {
    path: string;
    content: string;
}
