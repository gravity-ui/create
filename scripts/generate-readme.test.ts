import {execFile as execFileCb} from 'node:child_process';
import path from 'node:path';
import {type TestContext, test} from 'node:test';
import {promisify} from 'node:util';

import readme from '../README.md' with {type: 'text'};

const execFile = promisify(execFileCb);
const rootDir = path.join(import.meta.dirname, '..');

test.describe('generate-readme', () => {
    test('README.md matches generated output', async (t: TestContext) => {
        const {stdout} = await execFile(
            process.execPath,
            ['--import', './scripts/test-runner-register.js', 'scripts/generate-readme.ts'],
            {cwd: rootDir},
        );

        t.assert.strictEqual(stdout, readme);
    });
});
