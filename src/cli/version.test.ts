import {type TestContext, test} from 'node:test';

import {readVersion} from './version.js';

test.describe('readVersion', () => {
    test('returns a dot-separated version string', (t: TestContext) => {
        t.assert.match(readVersion(), /^\d+\.\d+\.\d+/);
    });
});
