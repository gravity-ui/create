import {type TestContext, test} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateStylelint} from './stylelint.js';

test.describe('stylelint generator', () => {
    test('project with styles generates stylelint config and deps', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateStylelint, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: ['styles'],
        });

        const config = file('/project/.stylelintrc.json');
        t.assert.ok(config);
        t.assert.deepEqual(config.content, {
            extends: [
                '@gravity-ui/stylelint-config',
                '@gravity-ui/stylelint-config/order',
                '@gravity-ui/stylelint-config/prettier',
            ],
        });
    });

    test('project without styles has no stylelint config or deps', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateStylelint, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
        });

        t.assert.equal(file('/project/.stylelintrc.json'), null);
    });
});
