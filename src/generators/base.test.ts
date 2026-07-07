import {type TestContext, test} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateBase} from './base.js';

test.describe('base generator', () => {
    test('no registry set: does not write .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
        });

        t.assert.equal(file('/project/.npmrc'), null);
    });

    test('custom registry: writes .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            registry: 'https://custom.registry.example/',
        });

        const npmrc = file('/project/.npmrc');
        t.assert.ok(npmrc);
        t.assert.match(String(npmrc.content), /registry=https:\/\/custom\.registry\.example\//);
    });

    test('registry equal to default npm registry: does not write obsolete .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            registry: 'https://registry.npmjs.org/',
        });

        t.assert.equal(file('/project/.npmrc'), null);
    });

    test('registry equal to default npm registry without trailing slash: does not write obsolete .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            registry: 'https://registry.npmjs.org',
        });

        t.assert.equal(file('/project/.npmrc'), null);
    });
});
