import type {CapturedFile} from '../utils/types.js';

export interface GenerateOptions {
    dryRun?: boolean;
}

export interface GenerateResult {
    files: readonly CapturedFile[];
}
