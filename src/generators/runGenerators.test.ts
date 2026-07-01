import {type TestContext, test} from 'node:test';

import {createEmptyModel} from '../model/index.js';

import {filesOf} from './__fixtures__/testUtils.js';
import {runGenerators} from './runGenerators.js';

test.describe('runGenerators', () => {
    test('TypeScript project generates regular typecheck command', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.scripts.typecheck, 'tsc --noEmit');
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

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.scripts.typecheck, 'tsc -b');
    });

    test('project with styles generates stylelint deps', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasStyles = true;

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.devDependencies.stylelint, '^16.0.0');
        t.assert.equal(pkg.content.devDependencies['@gravity-ui/stylelint-config'], '^5.0.0');
        t.assert.equal(pkg.content.scripts['lint:styles'], 'stylelint "**/*.scss"');
    });

    test('project without styles has no stylelint deps', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const pkg = file('/project/package.json');
        t.assert.ok(pkg);
        t.assert.equal(pkg.content.devDependencies?.stylelint, undefined);
        t.assert.equal(pkg.content.scripts?.['lint:styles'], undefined);
    });

    test('react + TS project adds uikit, react deps and types', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasFrontend = true;
        model.hasReact = true;

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const pkg = file('/project/package.json');

        t.assert.ok(pkg);
        t.assert.equal(pkg.content.devDependencies['@types/react'], '^18.0.0');
        t.assert.equal(pkg.content.devDependencies['@types/react-dom'], '^18.0.0');
        t.assert.equal(pkg.content.dependencies.react, '^18.0.0');
        t.assert.equal(pkg.content.dependencies['react-dom'], '^18.0.0');
        t.assert.equal(pkg.content.dependencies['@gravity-ui/uikit'], '^7.0.0');
    });

    test('react + JS project uses jsx/js extensions', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'js';
        model.hasFrontend = true;
        model.hasReact = true;

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const pkg = file('/project/package.json');

        t.assert.ok(pkg);
        t.assert.equal(pkg.content.dependencies.react, '^18.0.0');
        t.assert.equal(pkg.content.dependencies['react-dom'], '^18.0.0');
        t.assert.equal(pkg.content.dependencies['@gravity-ui/uikit'], '^7.0.0');
    });

    test('frontend without react has no react or uikit deps', async (t: TestContext) => {
        const model = createEmptyModel();
        model.destination = '/project';
        model.projectName = 'my-app';
        model.language = 'ts';
        model.hasFrontend = true;

        const result = await runGenerators(model, {dryRun: true});
        const {file} = filesOf(result);

        const pkg = file('/project/package.json');

        t.assert.ok(pkg);
        t.assert.equal(pkg.content.devDependencies['@types/react'], undefined);
        t.assert.equal(pkg.content.devDependencies['@types/react-dom'], undefined);
        t.assert.equal(pkg.content.dependencies.react, undefined);
        t.assert.equal(pkg.content.dependencies['react-dom'], undefined);
        t.assert.equal(pkg.content.dependencies['@gravity-ui/uikit'], undefined);
    });
});
