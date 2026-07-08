import {test as base, expect} from '@playwright/test';

type Fixtures = {
    assertHeading: (expected: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
    assertHeading: async ({page}, use) => {
        await use(async (expected) => {
            await page.goto('/');
            await expect(page.locator('h1')).toHaveText(expected);
        });
    },
});

export {expect};
