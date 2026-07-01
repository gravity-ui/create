import {type TestContext, test} from 'node:test';

import {createEmptyModel} from '../model/index.js';

import {filesOf} from './__fixtures__/testUtils.js';
import {runGenerators} from './runGenerators.js';

test.describe('runGenerators', () => {
    test('TypeScript project generates tsconfig.json', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const tsconfig = file('/project/tsconfig.json');
        t.assert.ok(tsconfig);
        t.assert.equal(tsconfig.content.extends, '@gravity-ui/tsconfig/tsconfig.json');
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
        const {file} = filesOf(result);

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

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.scripts.typecheck, 'tsc -b');
    });

    test('frontend-only project references only src/ui', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasFrontend = true;

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const root = file('/project/tsconfig.json');
        t.assert.ok(root);
        t.assert.deepEqual(root.content.references, [{path: './src/ui'}]);

        t.assert.equal(file('/project/src/server/tsconfig.json'), null);
    });

    test('project with styles generates stylelint config and deps', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasStyles = true;

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const config = file('/project/.stylelintrc.json');
        t.assert.ok(config);
        t.assert.deepEqual(config.content, {
            extends: [
                '@gravity-ui/stylelint-config',
                '@gravity-ui/stylelint-config/order',
                '@gravity-ui/stylelint-config/prettier',
            ],
        });

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.devDependencies.stylelint, '^16.0.0');
        t.assert.equal(pkg.content.devDependencies['@gravity-ui/stylelint-config'], '^5.0.0');
        t.assert.equal(pkg.content.scripts['lint:styles'], 'stylelint "**/*.scss"');
    });

    test('project without styles has no stylelint config or deps', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        t.assert.equal(file('/project/.stylelintrc.json'), null);

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.devDependencies?.stylelint, undefined);
        t.assert.equal(pkg.content.scripts?.['lint:styles'], undefined);
    });
});
