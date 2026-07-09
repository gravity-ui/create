import {type TestContext, test} from 'node:test';

import {CliSchema} from './schema.js';

test.describe('CliSchema destination validation', () => {
    test('rejects a destination whose basename is not kebab-case', (t: TestContext) => {
        const result = CliSchema.safeParse({out: './My Bad Name'});
        t.assert.equal(result.success, false);
    });

    test('accepts a destination whose basename is kebab-case', (t: TestContext) => {
        const result = CliSchema.safeParse({out: './nested/my-app'});
        t.assert.equal(result.success, true);
    });

    test('accepts when out is not provided at all', (t: TestContext) => {
        const result = CliSchema.safeParse({});
        t.assert.equal(result.success, true);
    });
});
