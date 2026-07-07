import {z} from 'zod';

import {validateDestination} from '../utils/destination.js';

export type FlagGroup = 'project' | 'mode' | 'other';

/**
 * Typed metadata attached to each field via .meta().
 * The helper exists purely for TypeScript — at runtime it's an identity function.
 */
export type FlagMeta = {
    description: string;
    group: FlagGroup;
    short?: string;
    placeholder?: string;
    negatable?: boolean;
};

function flagMeta(m: FlagMeta): FlagMeta {
    return m;
}

/**
 * Special metadata for the positional argument. Kept separate so the help
 * renderer can put it in the usage line, not in a flag group.
 */
export type PositionalMeta = {
    description: string;
    positional: true;
};

/**
 * The schema — single source of truth for shape, validation, types, and CLI metadata.
 */
export const CliSchema = z
    .object({
        out: z
            .string()
            .optional()
            .meta(
                flagMeta({
                    description: 'Destination folder for the new project',
                    group: 'project',
                    placeholder: '<path>',
                }),
            ),

        language: z
            .enum(['ts', 'js'])
            .optional()
            .meta(
                flagMeta({
                    description: 'Project language',
                    group: 'project',
                    placeholder: '<ts|js>',
                }),
            ),

        frontend: z
            .boolean()
            .optional()
            .meta(
                flagMeta({
                    description: 'Include frontend setup',
                    group: 'project',
                    negatable: true,
                }),
            ),

        styles: z
            .boolean()
            .optional()
            .meta(
                flagMeta({
                    description: 'Include stylelint (requires --frontend)',
                    group: 'project',
                    negatable: true,
                }),
            ),

        react: z
            .boolean()
            .optional()
            .meta(
                flagMeta({
                    description: 'Include React + JSX transform (requires --frontend)',
                    group: 'project',
                    negatable: true,
                }),
            ),

        backend: z
            .boolean()
            .optional()
            .meta(
                flagMeta({
                    description: 'Include nodekit backend',
                    group: 'project',
                    negatable: true,
                }),
            ),

        registry: z
            .url('Registry must be a valid URL')
            .optional()
            .meta(
                flagMeta({
                    description: 'Custom npm registry',
                    group: 'project',
                    placeholder: '<url>',
                }),
            ),

        yes: z
            .boolean()
            .default(false)
            .meta(
                flagMeta({
                    description: 'Accept defaults, skip prompts',
                    group: 'mode',
                    short: 'y',
                }),
            ),

        'dry-run': z
            .boolean()
            .default(false)
            .meta(
                flagMeta({
                    description: 'Show what would be generated without writing files',
                    group: 'mode',
                }),
            ),

        help: z
            .boolean()
            .default(false)
            .meta(
                flagMeta({
                    description: 'Show this help and exit',
                    group: 'other',
                    short: 'h',
                }),
            ),

        version: z
            .boolean()
            .default(false)
            .meta(
                flagMeta({
                    description: 'Print version and exit',
                    group: 'other',
                    short: 'v',
                }),
            ),
    })
    .refine((d) => !(d.styles === true && d.frontend === false), {
        message: '--styles requires --frontend',
        path: ['styles'],
    })
    .refine((d) => !(d.react === true && d.frontend === false), {
        message: '--react requires --frontend',
        path: ['react'],
    })
    .superRefine((d, ctx) => {
        if (d.out === undefined) {
            return;
        }
        const message = validateDestination(process.cwd(), d.out);
        if (message) {
            ctx.addIssue({code: 'custom', message, path: ['out']});
        }
    });

export type ParsedCli = z.infer<typeof CliSchema>;

/**
 * Defaults applied when --yes is passed and a flag was not given explicitly.
 * `satisfies` ties this to ParsedCli's shape so it can't drift from CliSchema.
 */
export const YES_DEFAULTS = {
    language: 'ts',
    frontend: true,
    styles: true,
    react: true,
    backend: false,
} satisfies Pick<ParsedCli, 'language' | 'frontend' | 'styles' | 'react' | 'backend'>;
