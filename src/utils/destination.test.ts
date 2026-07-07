import {type TestContext, mock, test} from 'node:test';

import {memfs} from 'memfs';

/**
 * validateDestination guards real disk state (existing folders, symlinks).
 * `node:fs` is mocked once for the whole file, and every test gets its own
 * directory namespace inside the shared volume — remocking per test doesn't
 * work here: dynamic `import()` of the same specifier returns Node's cached
 * module, so a module already loaded against the first mock never rebinds
 * to a later mock.module() call.
 */
const {fs, vol} = memfs({
    '/case-fresh/cwd': null,
    '/case-traversal/cwd': null,
    '/case-absolute/cwd': null,
    '/case-exists/cwd/my-app/.keep': '',
    '/case-allow-existing/cwd/my-app/.keep': '',
    '/case-symlink/cwd': null,
    '/case-symlink/outside': null,
});
vol.symlinkSync('/case-symlink/outside', '/case-symlink/cwd/escape-hatch');

mock.module('node:fs', {
    namedExports: {
        existsSync: (p: string) => fs.existsSync(p),
        realpathSync: (p: string) => fs.realpathSync(p),
    },
});

const {validateDestination} =
    (await import('./destination.js')) as typeof import('./destination.js');

test.describe('validateDestination', () => {
    test('accepts a fresh kebab-case folder inside cwd', (t: TestContext) => {
        t.assert.equal(validateDestination('/case-fresh/cwd', './my-app'), undefined);
    });

    test('rejects traversal outside cwd', (t: TestContext) => {
        t.assert.match(
            validateDestination('/case-traversal/cwd', '../my-app') ?? '',
            /inside the current directory/,
        );
        t.assert.match(
            validateDestination('/case-traversal/cwd', '..') ?? '',
            /inside the current directory/,
        );
    });

    test('rejects an absolute path outside cwd', (t: TestContext) => {
        t.assert.match(
            validateDestination('/case-absolute/cwd', '/somewhere/else/my-app') ?? '',
            /inside the current directory/,
        );
    });

    test('rejects an already-existing destination', (t: TestContext) => {
        t.assert.match(validateDestination('/case-exists/cwd', './my-app') ?? '', /already exists/);
    });

    test('allows an already-existing destination when allowExisting is set (--dry-run)', (t: TestContext) => {
        t.assert.equal(
            validateDestination('/case-allow-existing/cwd', './my-app', {allowExisting: true}),
            undefined,
        );
    });

    test('rejects escaping cwd through a symlink planted inside it', (t: TestContext) => {
        t.assert.match(
            validateDestination('/case-symlink/cwd', './escape-hatch/my-app') ?? '',
            /inside the current directory/,
        );
    });
});
