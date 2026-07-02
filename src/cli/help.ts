import {styleText} from 'node:util';

import {type FieldInfo, isFlag, listFields} from './introspect.js';
import type {FlagGroup, FlagMeta} from './schema.js';

const GROUP_ORDER: readonly FlagGroup[] = ['project', 'mode', 'other'];
const GROUP_LABELS: Record<FlagGroup, string> = {
    project: 'Project options',
    mode: 'Mode options',
    other: 'Other',
};

function visibleLength(s: string): number {
    // eslint-disable-next-line no-control-regex
    return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}

function formatSignature(field: FieldInfo & {meta: FlagMeta}): string {
    const parts: string[] = [];
    if (field.meta.short) {
        parts.push(styleText('cyan', `-${field.meta.short}`));
    }
    parts.push(styleText('cyan', `--${field.name}`));
    if (field.meta.negatable) {
        parts.push(styleText('cyan', `--no-${field.name}`));
    }

    let sig = parts.join(', ');
    if (field.meta.placeholder) {
        sig += ' ' + styleText('dim', field.meta.placeholder);
    }
    return sig;
}

function renderHelp(): string {
    const fields = listFields();
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

    // Group flags
    const byGroup = new Map<FlagGroup, Array<FieldInfo & {meta: FlagMeta}>>();
    for (const field of fields) {
        if (!isFlag(field)) {
            continue;
        }
        const group = field.meta.group;
        const list = byGroup.get(group) ?? [];
        list.push(field);
        byGroup.set(group, list);
    }

    // Compute alignment width across all flag signatures
    const allSignatures = fields.filter(isFlag).map((f) => formatSignature(f));
    const colWidth = Math.max(...allSignatures.map(visibleLength)) + 2;

    for (const group of GROUP_ORDER) {
        const flags = byGroup.get(group);
        if (!flags || flags.length === 0) {
            continue;
        }

        lines.push(styleText('bold', GROUP_LABELS[group]));
        for (const field of flags) {
            const sig = formatSignature(field);
            const padding = ' '.repeat(Math.max(1, colWidth - visibleLength(sig)));
            let line = `  ${sig}${padding}${field.meta.description}`;
            if (field.choices) {
                line += ' ' + styleText('dim', `(${field.choices.join('|')})`);
            }
            lines.push(line);
        }
        lines.push('');
    }

    // Examples
    lines.push(styleText('bold', 'Examples'));
    const examples: Array<[string, string]> = [
        ['npm create @gravity-ui', 'fully interactive'],
        ['npm create @gravity-ui -- --path my-app', 'specify path'],
        [
            'npm create @gravity-ui -- --path my-package --language ts --no-frontend --no-backend -y',
            'basic TypeScript package',
        ],
        [
            'npm create @gravity-ui -- --path my-api --language ts --no-frontend --backend -y',
            'TypeScript backend service',
        ],
        ['npm create @gravity-ui -- --path my-app --dry-run', 'preview without writing'],
    ];
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
