import {type TestContext, test} from 'node:test';

import {parseCli} from './args.js';

test.describe('parseCli', () => {
    test('parses string and enum flags', (t: TestContext) => {
        const result = parseCli(['--out', './my-app', '--language', 'ts']);
        t.assert.equal(result.out, './my-app');
        t.assert.equal(result.language, 'ts');
    });

    test('parses boolean flags', (t: TestContext) => {
        const result = parseCli(['--frontend', '--backend']);
        t.assert.equal(result.frontend, true);
        t.assert.equal(result.backend, true);
    });

    test('parses negated boolean flags', (t: TestContext) => {
        const result = parseCli(['--no-frontend']);
        t.assert.equal(result.frontend, false);
    });

    test('parses short flags', (t: TestContext) => {
        const result = parseCli(['-y', '-h', '-v']);
        t.assert.equal(result.yes, true);
        t.assert.equal(result.help, true);
        t.assert.equal(result.version, true);
    });

    test('defaults yes/dry-run/help/version to false when omitted', (t: TestContext) => {
        const result = parseCli([]);
        t.assert.equal(result.yes, false);
        t.assert.equal(result['dry-run'], false);
        t.assert.equal(result.help, false);
        t.assert.equal(result.version, false);
    });

    test('throws on a positional argument', (t: TestContext) => {
        t.assert.throws(
            () => parseCli(['some-folder']),
            /Unexpected positional argument: some-folder/,
        );
    });

    test('positional error suggests --out', (t: TestContext) => {
        t.assert.throws(() => parseCli(['some-folder']), /Did you mean --out some-folder\?/);
    });

    test('throws on an unknown flag', (t: TestContext) => {
        t.assert.throws(() => parseCli(['--nope']));
    });

    test('formats a zod error for a flag with --prefix', (t: TestContext) => {
        t.assert.throws(() => parseCli(['--language', 'cobol']), /^Error: --language: /);
    });

    test('formats the out field error without a -- prefix', (t: TestContext) => {
        t.assert.throws(() => parseCli(['--out', './Bad Name']), /^Error: out: /);
    });

    test('joins multiple zod issues with a newline', (t: TestContext) => {
        t.assert.throws(
            () => parseCli(['--styles', '--no-frontend']),
            (err: unknown) => {
                t.assert.ok(err instanceof Error);
                t.assert.match((err as Error).message, /--styles: --styles requires --frontend/);
                return true;
            },
        );
    });
});
