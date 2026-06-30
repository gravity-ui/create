import {type TestContext, test} from 'node:test';

import {createEmptyModel} from '../model/index.js';

import {runGenerators} from './runGenerators.js';

test.describe('runGenerators', () => {
    test('TypeScript project generates tsconfig.json', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';

        const result = await runGenerators(model, {dryRun: true});

        const tsconfig = result.files.find((f) => f.path === '/project/tsconfig.json');
        t.assert.ok(tsconfig);
        const parsed = JSON.parse(tsconfig.content);
        t.assert.equal(parsed.extends, '@gravity-ui/tsconfig/tsconfig.json');
    });
});
