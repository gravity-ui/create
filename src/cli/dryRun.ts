import path from 'node:path';
import {styleText} from 'node:util';

import {note} from '@clack/prompts';

import type {CapturedFile} from '../utils/types.js';

import type {DryRunSummary} from './types.js';

export function buildDryRunSummary(
    destination: string,
    files: readonly CapturedFile[],
): DryRunSummary {
    const sorted = [...files].sort((a, b) => {
        const aParts = a.path.split(path.sep);
        const bParts = b.path.split(path.sep);
        const len = Math.min(aParts.length, bParts.length);

        for (let i = 0; i < len; i++) {
            const aIsLast = i === aParts.length - 1;
            const bIsLast = i === bParts.length - 1;

            // At the same level: directory (not last segment) comes before file
            if (aIsLast !== bIsLast) {
                return aIsLast ? 1 : -1;
            }

            if (aParts[i] !== bParts[i]) {
                return aParts[i].localeCompare(bParts[i]);
            }
        }
        return aParts.length - bParts.length;
    });

    return {
        title: `Would create ${files.length} files in ${destination}:`,
        files: sorted.map((file) => ({
            path: path.relative(destination, file.path),
            size: Buffer.byteLength(file.content, 'utf8'),
        })),
    };
}

function formatDryRunSummary(summary: DryRunSummary): string {
    return summary.files
        .map((file) => `  ${file.path}  ${styleText('dim', `(${file.size} B)`)}\n`)
        .join('');
}

export function renderDryRunSummary(destination: string, files: readonly CapturedFile[]): void {
    const summary = buildDryRunSummary(destination, files);
    note(formatDryRunSummary(summary), styleText('bold', summary.title));
}
