import {type TestContext, test} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateBase} from './base.js';

test.describe('base generator', () => {
    test('no registry set: does not write .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
        });

        t.assert.equal(file('.npmrc'), null);
    });

    test('custom registry: writes .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            registry: 'https://custom.registry.example/',
        });

        const npmrc = file('.npmrc');
        t.assert.ok(npmrc);
        t.assert.match(String(npmrc.content), /registry=https:\/\/custom\.registry\.example\//);
    });

    test('registry equal to default npm registry: does not write obsolete .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            registry: 'https://registry.npmjs.org/',
        });

        t.assert.equal(file('.npmrc'), null);
    });

    test('registry equal to default npm registry without trailing slash: does not write obsolete .npmrc', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            registry: 'https://registry.npmjs.org',
        });

        t.assert.equal(file('.npmrc'), null);
    });

    test('dependencies and devDependencies are sorted alphabetically, not insertion order', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateBase, {
            destination: '/project',
            projectName: 'my-app',
            packages: {
                dependencies: {
                    zeta: '1.0.0',
                    alpha: '1.0.0',
                    mu: '1.0.0',
                    '@gravity-ui/uikit': '1.0.0',
                },
                devDependencies: {typescript: '1.0.0', eslint: '1.0.0'},
            },
        });

        const pkg = file('package.json');
        t.assert.ok(pkg);
        t.assert.deepEqual(Object.keys(pkg.content.dependencies), [
            '@gravity-ui/uikit',
            'alpha',
            'mu',
            'zeta',
        ]);
        t.assert.deepEqual(Object.keys(pkg.content.devDependencies), ['eslint', 'typescript']);
    });
});
