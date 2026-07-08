import assert from 'node:assert/strict';
import path from 'node:path';
import {test} from 'node:test';

import {buildNextSteps} from './nextSteps.js';

test('buildNextSteps', async (t) => {
    await t.test('destination directly under cwd', () => {
        const steps = buildNextSteps(
            {destination: path.join('/repo', 'my-app'), hasBackend: false},
            '/repo',
        );
        assert.deepStrictEqual(steps, ['cd my-app', 'npm install']);
    });

    await t.test('destination nested under cwd', () => {
        const steps = buildNextSteps(
            {destination: path.join('/repo', 'foo', 'bar'), hasBackend: false},
            '/repo',
        );
        assert.deepStrictEqual(steps, [`cd ${path.join('foo', 'bar')}`, 'npm install']);
    });

    await t.test('includes npm run dev when hasBackend', () => {
        const steps = buildNextSteps(
            {destination: path.join('/repo', 'my-app'), hasBackend: true},
            '/repo',
        );
        assert.deepStrictEqual(steps, ['cd my-app', 'npm install', 'npm run dev']);
    });
});
