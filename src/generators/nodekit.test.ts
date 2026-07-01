import {type TestContext, test} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateNodekit} from './nodekit.js';

test.describe('nodekit generator', () => {
    test('no backend skips generation', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateNodekit, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
        });

        t.assert.equal(file('/project/src/server/index.ts'), null);
    });

    test('backend only writes hello world server', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateNodekit, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasBackend: true,
        });

        const server = file('/project/src/server/index.ts');
        t.assert.ok(server);
        t.assert.match(server.content, /Hello, world!/);
        t.assert.doesNotMatch(server.content, /app-layout/);
    });

    test('frontend + backend wires app-layout render', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateNodekit, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasFrontend: true,
            hasBackend: true,
        });

        const server = file('/project/src/server/index.ts');
        t.assert.ok(server);
        t.assert.match(server.content, /@gravity-ui\/app-layout/);
        t.assert.match(server.content, /assets-manifest\.json/);
        t.assert.match(server.content, /'GET \*'/);
    });
});
