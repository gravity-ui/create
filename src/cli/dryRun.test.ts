import path from 'node:path';
import {type TestContext, test} from 'node:test';

import {buildDryRunSummary} from './dryRun.js';

test.describe('buildDryRunSummary', () => {
    test('title reports file count and destination', (t: TestContext) => {
        const destination = path.join('/repo', 'my-app');
        const summary = buildDryRunSummary(destination, [
            {path: path.join(destination, 'package.json'), content: '{}'},
        ]);
        t.assert.equal(summary.title, `Would create 1 files in ${destination}:`);
    });

    test('reports each file path relative to destination and its byte size', (t: TestContext) => {
        const destination = path.join('/repo', 'my-app');
        const summary = buildDryRunSummary(destination, [
            {path: path.join(destination, 'package.json'), content: '{"a":1}'},
        ]);
        t.assert.deepStrictEqual(summary.files, [{path: 'package.json', size: 7}]);
    });

    test('computes byte size, not character length, for multi-byte content', (t: TestContext) => {
        const destination = path.join('/repo', 'my-app');
        const summary = buildDryRunSummary(destination, [
            {path: path.join(destination, 'a.txt'), content: '日本語'},
        ]);
        t.assert.equal(summary.files[0].size, Buffer.byteLength('日本語', 'utf8'));
    });

    test('sorts directories before files at the same nesting level', (t: TestContext) => {
        const destination = path.join('/repo', 'my-app');
        const summary = buildDryRunSummary(destination, [
            {path: path.join(destination, 'z.txt'), content: ''},
            {path: path.join(destination, 'src', 'index.ts'), content: ''},
        ]);
        t.assert.deepStrictEqual(
            summary.files.map((f) => f.path),
            [path.join('src', 'index.ts'), 'z.txt'],
        );
    });

    test('sorts entries at the same level alphabetically', (t: TestContext) => {
        const destination = path.join('/repo', 'my-app');
        const summary = buildDryRunSummary(destination, [
            {path: path.join(destination, 'b.txt'), content: ''},
            {path: path.join(destination, 'a.txt'), content: ''},
        ]);
        t.assert.deepStrictEqual(
            summary.files.map((f) => f.path),
            ['a.txt', 'b.txt'],
        );
    });
});
