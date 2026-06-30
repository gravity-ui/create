import path from 'node:path';
import {styleText} from 'node:util';

import {note} from '@clack/prompts';

import type {CapturedFile} from '../utils/types.js';

const sep = '/';

export function renderDryRunSummary(destination: string, files: readonly CapturedFile[]): void {
    let filesListing = '';

    const sorted = [...files].sort((a, b) => {
        const aParts = a.path.split(sep);
        const bParts = b.path.split(sep);
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

    for (const file of sorted) {
        const rel = path.relative(destination, file.path);
        const size = Buffer.byteLength(file.content, 'utf8');
        filesListing += `  ${rel}  ${styleText('dim', `(${size} B)`)}\n`;
    }

    note(filesListing, styleText('bold', `Would create ${files.length} files in ${destination}:`));
}
