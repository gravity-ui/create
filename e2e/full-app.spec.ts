import {test} from './fixtures.js';

test('renders the Gravity UI heading', {tag: '@frontend-react'}, async ({assertHeading}) => {
    await assertHeading('Hello, Gravity UI!');
});
