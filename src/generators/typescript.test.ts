import {type TestContext, test} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateTypeScript} from './typescript.js';

test.describe('typescript generator', () => {
    test('TypeScript project generates tsconfig.json + tsconfig.build.json', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
        });

        const tsconfig = file('/project/tsconfig.json');
        t.assert.ok(tsconfig);
        t.assert.equal(tsconfig.content.extends, '@gravity-ui/tsconfig/tsconfig.json');

        const buildTsconfig = file('/project/tsconfig.build.json');
        t.assert.ok(buildTsconfig);
        t.assert.equal(buildTsconfig.content.compilerOptions.declaration, true);
    });

    test('frontend + backend project generates referenced tsconfigs and tsc -b', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasFrontend: true,
            hasReact: true,
            hasBackend: true,
        });

        const root = file('/project/tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content, {
            files: [],
            references: [{path: './src/ui'}, {path: './src/server'}],
        });

        const ui = file('/project/src/ui/tsconfig.json');
        t.assert.ok(ui);
        t.assert.equal(ui.content.compilerOptions.composite, true);
        t.assert.equal(ui.content.compilerOptions.jsx, 'react-jsx');

        const server = file('/project/src/server/tsconfig.json');
        t.assert.ok(server);
        t.assert.equal(server.content.compilerOptions.composite, true);
    });

    test('frontend-only project references only src/ui', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasFrontend: true,
        });

        const root = file('/project/tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content.references, [{path: './src/ui'}]);

        t.assert.equal(file('/project/src/server/tsconfig.json'), null);
    });
});
