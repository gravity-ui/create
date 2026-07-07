import {type ParseArgsConfig, parseArgs} from 'node:util';

import {z} from 'zod';

import {isFlag, listFields} from './introspect.js';
import {CliSchema, type ParsedCli} from './schema.js';

function buildParseArgsOptions(): NonNullable<ParseArgsConfig['options']> {
    const options: NonNullable<ParseArgsConfig['options']> = {};

    for (const field of listFields()) {
        // skip positionals
        if (!isFlag(field)) {
            continue;
        }

        options[field.name] = {
            type: field.kind === 'boolean' ? 'boolean' : 'string',
        };
        if (field.meta.short) {
            (options[field.name] as {short?: string}).short = field.meta.short;
        }
    }

    return options;
}

function formatZodError(err: z.ZodError): string {
    return err.issues
        .map((e) => {
            const fieldName = e.path[0]?.toString() ?? 'argument';
            const prefix = fieldName === 'out' ? fieldName : `--${fieldName}`;
            return `${prefix}: ${e.message}`;
        })
        .join('\n');
}

export function parseCli(argv: string[]): ParsedCli {
    const {values: rawValues, positionals} = parseArgs({
        args: argv,
        options: buildParseArgsOptions(),
        allowPositionals: true,
        allowNegative: true,
        strict: true,
    });

    // Currently: any positional is an error (no commands yet)
    if (positionals.length > 0) {
        throw new Error(
            `Unexpected positional argument: ${positionals[0]}. ` +
                `Did you mean --out ${positionals[0]}?`,
        );
    }

    try {
        return CliSchema.parse(rawValues);
    } catch (err) {
        if (err instanceof z.ZodError) {
            throw new Error(formatZodError(err));
        }
        throw err;
    }
}
