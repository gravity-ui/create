import path from 'node:path';
import {type TestContext, test} from 'node:test';

import {buildNextSteps} from './nextSteps.js';

test.describe('buildNextSteps', () => {
    test('destination directly under cwd', (t: TestContext) => {
        const steps = buildNextSteps(
            {destination: path.join('/repo', 'my-app'), hasBackend: false},
            '/repo',
        );
        t.assert.deepStrictEqual(steps, ['cd my-app', 'npm install']);
    });

    test('destination nested under cwd', (t: TestContext) => {
        const steps = buildNextSteps(
            {destination: path.join('/repo', 'foo', 'bar'), hasBackend: false},
            '/repo',
        );
        t.assert.deepStrictEqual(steps, [`cd ${path.join('foo', 'bar')}`, 'npm install']);
    });

    test('includes npm run dev when hasBackend', (t: TestContext) => {
        const steps = buildNextSteps(
            {destination: path.join('/repo', 'my-app'), hasBackend: true},
            '/repo',
        );
        t.assert.deepStrictEqual(steps, ['cd my-app', 'npm install', 'npm run dev']);
    });
});
