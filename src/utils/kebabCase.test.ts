import {type TestContext, test} from 'node:test';

import {isKebabCase} from './kebabCase.js';

test.describe('isKebabCase', () => {
    test('accepts lowercase hyphenated names', (t: TestContext) => {
        t.assert.equal(isKebabCase('my-app'), true);
        t.assert.equal(isKebabCase('app'), true);
        t.assert.equal(isKebabCase('my-app-2'), true);
    });

    test('rejects uppercase, spaces, underscores, and leading/trailing hyphens', (t: TestContext) => {
        t.assert.equal(isKebabCase('My-App'), false);
        t.assert.equal(isKebabCase('my app'), false);
        t.assert.equal(isKebabCase('my_app'), false);
        t.assert.equal(isKebabCase('-my-app'), false);
        t.assert.equal(isKebabCase('my-app-'), false);
        t.assert.equal(isKebabCase('my--app'), false);
        t.assert.equal(isKebabCase(''), false);
    });
});
