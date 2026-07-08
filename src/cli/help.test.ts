import {type TestContext, test} from 'node:test';

import {buildHelpData} from './help.js';

test.describe('buildHelpData', () => {
    test('examples are non-empty and each has a command and a comment', (t: TestContext) => {
        const {examples} = buildHelpData();
        t.assert.ok(examples.length > 0);
        for (const [cmd, comment] of examples) {
            t.assert.ok(cmd.startsWith('npm create @gravity-ui'));
            t.assert.ok(comment.length > 0);
        }
    });
});
