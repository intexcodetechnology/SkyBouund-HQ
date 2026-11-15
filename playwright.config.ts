import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/Browser',
    workers: 1,
    timeout: 60000,
    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:8001',
        channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
        headless: true,
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
        trace: 'off',
    },
});
