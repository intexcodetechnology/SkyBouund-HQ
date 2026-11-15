import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { totp } from './totp';
export async function login(page: Page) {
    const credentials = JSON.parse(
        readFileSync(
            process.env.E2E_CREDENTIALS_FILE || '.local/e2e-login.json',
            'utf8',
        ),
    ) as { email: string; password: string; secret: string };
    await page.goto('/login');
    await page.locator('#email').fill(credentials.email);
    await page.locator('#password').fill(credentials.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL('**/two-factor-challenge');
    await page
        .locator('input[autocomplete="one-time-code"]')
        .fill(totp(credentials.secret));
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForURL('**/dashboard');
}
