import {styleText} from 'node:util';

import {isFlag, listFields} from './introspect.js';
import type {FlagGroup} from './schema.js';
import type {FlagSignature, HelpData, HelpFlag} from './types.js';

const GROUP_ORDER: readonly FlagGroup[] = ['project', 'mode', 'other'];
const GROUP_LABELS: Record<FlagGroup, string> = {
    project: 'Project options',
    mode: 'Mode options',
    other: 'Other',
};

const EXAMPLES: ReadonlyArray<readonly [cmd: string, comment: string]> = [
    ['npm create @gravity-ui', 'fully interactive'],
    ['npm create @gravity-ui -- --out my-app', 'specify path'],
    [
        'npm create @gravity-ui -- --out my-package --language ts --no-frontend --no-backend -y',
        'basic TypeScript package',
    ],
    [
        'npm create @gravity-ui -- --out my-api --language ts --no-frontend --backend -y',
        'TypeScript backend service',
    ],
    ['npm create @gravity-ui -- --out my-app --dry-run', 'preview without writing'],
];

function buildSignature({
    name,
    short,
    negatable,
    placeholder,
}: Pick<HelpFlag, 'name' | 'short' | 'negatable' | 'placeholder'>): FlagSignature {
    const parts: string[] = [];
    if (short) {
        parts.push(`-${short}`);
    }
    parts.push(`--${name}`);
    if (negatable) {
        parts.push(`--no-${name}`);
    }
    return {parts, placeholder};
}

function signatureWidth({parts, placeholder}: FlagSignature): number {
    const partsWidth = parts.join(', ').length;
    return placeholder ? partsWidth + 1 + placeholder.length : partsWidth;
}

/** Grouping + examples, kept free of styleText so it's cheap to assert on in tests. */
export function buildHelpData(): HelpData {
    const byGroup = new Map<FlagGroup, HelpFlag[]>();
    for (const field of listFields()) {
        if (!isFlag(field)) {
            continue;
        }
        const {short, negatable, placeholder} = field.meta;
        const list = byGroup.get(field.meta.group) ?? [];
        list.push({
            name: field.name,
            short,
            negatable,
            placeholder,
            description: field.meta.description,
            choices: field.choices,
            signature: buildSignature({name: field.name, short, negatable, placeholder}),
        });
        byGroup.set(field.meta.group, list);
    }

    const groups = GROUP_ORDER.filter((group) => byGroup.has(group)).map((group) => ({
        group,
        label: GROUP_LABELS[group],
        flags: byGroup.get(group) ?? [],
    }));

    const maxSignatureWidth = Math.max(
        ...groups.flatMap((g) => g.flags).map((f) => signatureWidth(f.signature)),
    );

    return {groups, examples: EXAMPLES, maxSignatureWidth};
}

function styleSignature({parts, placeholder}: FlagSignature): string {
    let sig = parts.map((part) => styleText('cyan', part)).join(', ');
    if (placeholder) {
        sig += ' ' + styleText('dim', placeholder);
    }
    return sig;
}

function renderHelp(): string {
    const {groups, examples, maxSignatureWidth} = buildHelpData();
    const lines: string[] = [];

    lines.push('');
    lines.push(
        styleText('bold', '@gravity-ui/create') +
            ' ' +
            styleText('dim', '— scaffold a Gravity UI stack project'),
    );
    lines.push('');

    lines.push(styleText('bold', 'Usage'));
    lines.push(
        '  ' + styleText('cyan', 'npm create @gravity-ui') + ' ' + styleText('dim', '[options]'),
    );
    lines.push('');

    const colWidth = maxSignatureWidth + 2;

    for (const {label, flags} of groups) {
        lines.push(styleText('bold', label));
        for (const flag of flags) {
            const padding = ' '.repeat(Math.max(1, colWidth - signatureWidth(flag.signature)));
            let line = `  ${styleSignature(flag.signature)}${padding}${flag.description}`;
            if (flag.choices) {
                line += ' ' + styleText('dim', `(${flag.choices.join('|')})`);
            }
            lines.push(line);
        }
        lines.push('');
    }

    // Examples
    lines.push(styleText('bold', 'Examples'));
    for (const [cmd, comment] of examples) {
        lines.push(`  ${styleText('dim', '$')} ${cmd}`);
        lines.push(`    ${styleText('dim', comment)}`);
    }
    lines.push('');

    return lines.join('\n');
}

export function printHelp(): void {
    process.stdout.write(renderHelp());
}
