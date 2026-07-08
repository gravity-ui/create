import {test} from './fixtures.js';

test('renders the plain heading', {tag: '@frontend-no-react'}, async ({assertHeading}) => {
    await assertHeading('Hello, world!');
});
