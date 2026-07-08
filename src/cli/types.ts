import type {FlagGroup} from './schema.js';

interface DryRunFileEntry {
    path: string;
    size: number;
}

export interface DryRunSummary {
    title: string;
    files: DryRunFileEntry[];
}

export interface FlagSignature {
    parts: string[];
    placeholder?: string;
}

export interface HelpFlag {
    name: string;
    short?: string;
    negatable?: boolean;
    placeholder?: string;
    description: string;
    choices?: readonly string[];
    signature: FlagSignature;
}

export interface HelpGroup {
    group: FlagGroup;
    label: string;
    flags: HelpFlag[];
}

export interface HelpData {
    groups: HelpGroup[];
    examples: ReadonlyArray<readonly [cmd: string, comment: string]>;
    /** Width of the widest flag signature across all groups — for column alignment. */
    maxSignatureWidth: number;
}
