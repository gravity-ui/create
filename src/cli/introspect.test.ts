import {type TestContext, test} from 'node:test';

import {isFlag, listFields} from './introspect.js';
import type {FieldInfo} from './introspect.js';

test.describe('listFields', () => {
    test('returns one entry per CliSchema field', (t: TestContext) => {
        const fields = listFields();
        const names = fields.map((f) => f.name);
        t.assert.deepEqual(
            names.sort(),
            [
                'out',
                'language',
                'frontend',
                'styles',
                'react',
                'backend',
                'registry',
                'yes',
                'dry-run',
                'help',
                'version',
            ].sort(),
        );
    });

    test('classifies boolean flags as kind "boolean"', (t: TestContext) => {
        const fields = listFields();
        for (const name of [
            'frontend',
            'styles',
            'react',
            'backend',
            'yes',
            'dry-run',
            'help',
            'version',
        ]) {
            const field = fields.find((f) => f.name === name);
            t.assert.ok(field, `expected field ${name}`);
            t.assert.equal(field?.kind, 'boolean');
        }
    });

    test('classifies enum fields as kind "enum" with choices', (t: TestContext) => {
        const fields = listFields();
        const language = fields.find((f) => f.name === 'language');
        t.assert.equal(language?.kind, 'enum');
        t.assert.deepEqual(language?.choices, ['ts', 'js']);
    });

    test('classifies plain string fields as kind "string"', (t: TestContext) => {
        const fields = listFields();
        for (const name of ['out', 'registry']) {
            const field = fields.find((f) => f.name === name);
            t.assert.equal(field?.kind, 'string');
        }
    });

    test('extracts group/short/placeholder/negatable meta for flags', (t: TestContext) => {
        const fields = listFields();

        const yes = fields.find((f) => f.name === 'yes');
        t.assert.deepEqual(yes?.meta, {
            description: 'Accept defaults, skip prompts',
            group: 'mode',
            short: 'y',
            placeholder: undefined,
            negatable: undefined,
        });

        const frontend = fields.find((f) => f.name === 'frontend');
        t.assert.deepEqual(frontend?.meta, {
            description: 'Include frontend setup',
            group: 'project',
            short: undefined,
            placeholder: undefined,
            negatable: true,
        });

        const out = fields.find((f) => f.name === 'out');
        t.assert.deepEqual(out?.meta, {
            description: 'Destination folder for the new project',
            group: 'project',
            short: undefined,
            placeholder: '<path>',
            negatable: undefined,
        });
    });
});

test.describe('isFlag', () => {
    const flagField: FieldInfo = {
        name: 'example-flag',
        kind: 'boolean',
        meta: {description: 'An example flag', group: 'other'},
    };

    const positionalField: FieldInfo = {
        name: 'example-positional',
        kind: 'string',
        meta: {description: 'An example positional', positional: true},
    };

    const noMetaField: FieldInfo = {
        name: 'example-no-meta',
        kind: 'string',
        meta: undefined,
    };

    test('is true for a field whose meta is a FlagMeta', (t: TestContext) => {
        t.assert.equal(isFlag(flagField), true);
    });

    test('is false for a field whose meta is a PositionalMeta', (t: TestContext) => {
        t.assert.equal(isFlag(positionalField), false);
    });

    test('is false for a field with no meta at all', (t: TestContext) => {
        t.assert.equal(isFlag(noMetaField), false);
    });
});
