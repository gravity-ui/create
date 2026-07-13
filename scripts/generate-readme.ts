import {readFile} from 'node:fs/promises';
import path from 'node:path';

import Handlebars from 'handlebars';

import {buildHelpData} from '../src/cli/help.js';
import type {FlagSignature} from '../src/cli/types.js';

const rootDir = path.join(import.meta.dirname, '..');
const templatesDir = path.join(import.meta.dirname, 'readme');

function formatSignature({parts, placeholder}: FlagSignature): string {
    return placeholder ? `${parts.join(', ')} ${placeholder}` : parts.join(', ');
}

function buildContext(pkg: {engines: {node: string}}) {
    const {groups, examples} = buildHelpData();

    return {
        groups: groups.map(({label, flags}) => ({
            label,
            flags: flags.map((flag) => ({
                signature: formatSignature(flag.signature),
                description: flag.choices
                    ? `${flag.description} (${flag.choices.join('|')})`
                    : flag.description,
            })),
        })),
        examples: examples.map(([cmd, comment]) => ({cmd, comment})),
        engines: pkg.engines.node,
    };
}

const [readmeSource, flagsTableSource, pkgSource] = await Promise.all([
    readFile(path.join(templatesDir, 'readme.hbs'), 'utf8'),
    readFile(path.join(templatesDir, 'flagsTable.hbs'), 'utf8'),
    readFile(path.join(rootDir, 'package.json'), 'utf8'),
]);

Handlebars.registerPartial('flagsTable', flagsTableSource);
const template = Handlebars.compile(readmeSource);
process.stdout.write(template(buildContext(JSON.parse(pkgSource))));
