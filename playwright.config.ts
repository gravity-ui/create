import {defineConfig} from '@playwright/test';

const appDir = process.env.E2E_APP_DIR;

if (!appDir) {
    throw new Error('E2E_APP_DIR must point to the scaffolded project directory to test.');
}

const port = process.env.APP_PORT ?? '3000';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
    testDir: './e2e',
    use: {
        baseURL,
    },
    webServer: {
        command: 'npm run dev',
        cwd: appDir,
        url: baseURL,
        env: {APP_PORT: port},
        reuseExistingServer: false,
    },
});
