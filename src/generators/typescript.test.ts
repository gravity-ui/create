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

        const tsconfig = file('tsconfig.json');
        t.assert.ok(tsconfig);
        t.assert.equal(tsconfig.content.extends, '@gravity-ui/tsconfig/tsconfig.json');

        const buildTsconfig = file('tsconfig.build.json');
        t.assert.ok(buildTsconfig);
        t.assert.equal(buildTsconfig.content.compilerOptions.declaration, true);
    });

    test('frontend + backend project generates referenced tsconfigs and tsc -b', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: ['react'],
            hasBackend: true,
        });

        const root = file('tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content, {
            files: [],
            references: [{path: './src/ui'}, {path: './src/server'}],
        });

        const ui = file('src/ui/tsconfig.json');
        t.assert.ok(ui);
        t.assert.equal(ui.content.compilerOptions.composite, true);
        t.assert.equal(ui.content.compilerOptions.jsx, 'react-jsx');

        const server = file('src/server/tsconfig.json');
        t.assert.ok(server);
        t.assert.equal(server.content.compilerOptions.composite, true);
    });

    test('frontend-only project references only src/ui', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: [],
        });

        const root = file('tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content.references, [{path: './src/ui'}]);

        t.assert.equal(file('src/server/tsconfig.json'), null);
    });

    test('JS project with frontend + backend still generates tsconfigs, no typecheck tooling', async (t: TestContext) => {
        const {file, model} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: ['react'],
            hasBackend: true,
        });

        const root = file('tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content, {
            files: [],
            references: [{path: './src/ui'}, {path: './src/server'}],
        });

        const ui = file('src/ui/tsconfig.json');
        t.assert.ok(ui);
        t.assert.equal(ui.content.compilerOptions.jsx, 'react-jsx');

        const server = file('src/server/tsconfig.json');
        t.assert.ok(server);
        t.assert.equal(server.content.compilerOptions.composite, true);

        t.assert.equal(model.scripts.typecheck, undefined);
        t.assert.equal(model.packages.devDependencies.typescript, undefined);
        t.assert.equal(model.packages.devDependencies['@gravity-ui/tsconfig'], undefined);
    });

    test('JS project with only frontend generates only src/ui tsconfig + root', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: ['styles'],
        });

        const root = file('tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content.references, [{path: './src/ui'}]);

        t.assert.ok(file('src/ui/tsconfig.json'));
        t.assert.equal(file('src/server/tsconfig.json'), null);
    });

    test('JS project with only backend generates only src/server tsconfig + root', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: false,
            hasBackend: true,
        });

        const root = file('tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content.references, [{path: './src/server'}]);

        t.assert.equal(file('src/ui/tsconfig.json'), null);
        t.assert.ok(file('src/server/tsconfig.json'));
    });

    test('JS project with no frontend/backend generates no tsconfig files', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateTypeScript, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: false,
            hasBackend: false,
        });

        t.assert.equal(file('tsconfig.json'), null);
        t.assert.equal(file('tsconfig.build.json'), null);
        t.assert.equal(file('src/ui/tsconfig.json'), null);
        t.assert.equal(file('src/server/tsconfig.json'), null);
    });
});
