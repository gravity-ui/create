import {z} from 'zod';

import {CliSchema} from './schema.js';
import type {FlagMeta, PositionalMeta} from './schema.js';

type FieldKind = 'boolean' | 'string' | 'enum';

export interface FieldInfo {
    name: string;
    kind: FieldKind;
    choices?: readonly string[];
    meta: FlagMeta | PositionalMeta | undefined;
}

// Compute once at module load — schema is static
const JSON_SCHEMA = z.toJSONSchema(CliSchema);

function classifyProperty(prop: Record<string, unknown>): {
    kind: FieldKind;
    choices?: readonly string[];
} {
    if (prop.type === 'boolean') {
        return {kind: 'boolean'};
    }
    if (Array.isArray(prop.enum)) {
        return {kind: 'enum', choices: prop.enum as readonly string[]};
    }
    return {kind: 'string'};
}

export function listFields(): FieldInfo[] {
    const properties =
        (JSON_SCHEMA as {properties?: Record<string, Record<string, unknown>>}).properties ?? {};

    const result: FieldInfo[] = [];
    for (const [name, prop] of Object.entries(properties)) {
        const {kind, choices} = classifyProperty(prop);

        // Extract our custom meta — JSON Schema standard keys are 'description', etc.
        // Our custom keys (group, short, placeholder, negatable, positional) live alongside.
        const meta = extractMeta(prop);

        result.push({name, kind, choices, meta});
    }

    return result;
}

function extractMeta(prop: Record<string, unknown>): FlagMeta | PositionalMeta | undefined {
    // Distinguish positional vs flag by the presence of our marker
    if (prop.positional === true) {
        return {
            description: String(prop.description ?? ''),
            positional: true,
        };
    }

    if (prop.group !== undefined) {
        return {
            description: String(prop.description ?? ''),
            group: prop.group as FlagMeta['group'],
            short: prop.short as string | undefined,
            placeholder: prop.placeholder as string | undefined,
            negatable: prop.negatable as boolean | undefined,
        };
    }

    return undefined;
}

export function isFlag(info: FieldInfo): info is FieldInfo & {meta: FlagMeta} {
    return info.meta !== undefined && !('positional' in info.meta);
}
