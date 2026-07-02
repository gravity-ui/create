import {expect, test} from '@playwright/test';

test('renders the Gravity UI heading', async ({page}) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('Hello, Gravity UI!');
});
