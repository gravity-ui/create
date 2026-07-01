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

    test('frontend + backend project generates referenced tsconfigs and tsc -b', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasFrontend = true;
        model.hasReact = true;
        model.hasBackend = true;

        const result = await runGenerators(model, {dryRun: true});

        const root = result.files.find((f) => f.path === '/project/tsconfig.json');
        t.assert.ok(root);
        const rootParsed = JSON.parse(root.content);
        t.assert.deepEqual(rootParsed, {
            files: [],
            references: [{path: './src/ui'}, {path: './src/server'}],
        });

        const ui = result.files.find((f) => f.path === '/project/src/ui/tsconfig.json');
        t.assert.ok(ui);
        const uiParsed = JSON.parse(ui.content);
        t.assert.equal(uiParsed.compilerOptions.composite, true);
        t.assert.equal(uiParsed.compilerOptions.jsx, 'react-jsx');

        const server = result.files.find((f) => f.path === '/project/src/server/tsconfig.json');
        t.assert.ok(server);
        const serverParsed = JSON.parse(server.content);
        t.assert.equal(serverParsed.compilerOptions.composite, true);

        const pkg = result.files.find((f) => f.path === '/project/package.json');
        t.assert.ok(pkg);
        const pkgParsed = JSON.parse(pkg.content);
        t.assert.equal(pkgParsed.scripts.typecheck, 'tsc -b');
    });

    test('frontend-only project references only src/ui', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasFrontend = true;

        const result = await runGenerators(model, {dryRun: true});

        const root = result.files.find((f) => f.path === '/project/tsconfig.json');
        t.assert.ok(root);
        const rootParsed = JSON.parse(root.content);
        t.assert.deepEqual(rootParsed.references, [{path: './src/ui'}]);

        const server = result.files.find((f) => f.path === '/project/src/server/tsconfig.json');
        t.assert.equal(server, undefined);
    });
});
