import { test, expect, type Page } from '@playwright/test';
import { login } from './support/login';

async function choose(page: Page, mode: 'Light' | 'Dark' | 'System') {
    await page.getByRole('radio', { name: mode, exact: true }).click();
    await expect(
        page.getByRole('radio', { name: mode, exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
}
async function dark(page: Page, value: boolean) {
    await expect(page.locator('html')).toHaveClass(
        value ? /dark/ : /^(?!.*\bdark\b)/,
    );
}

test('appearance controls exist only in Account Settings and preserve global themes', async ({
    page,
}, info) => {
    test.setTimeout(120000);
    await login(page);
    await expect(
        page.getByRole('radiogroup', { name: 'Appearance' }),
    ).toHaveCount(0);
    await page.goto('/settings/appearance');
    await expect(
        page.getByRole('radiogroup', { name: 'Appearance' }),
    ).toHaveCount(1);
    await choose(page, 'Dark');
    await page.goto('/dashboard');
    await dark(page, true);
    await page
        .getByRole('button', { name: 'Collapse sidebar', exact: true })
        .click();
    await dark(page, true);
    for (const url of [
        '/customers',
        '/tasks',
        '/products',
        '/agents',
        '/reports',
        '/system-settings',
        '/auto-dialing',
        '/settings/profile',
        '/settings/security',
    ]) {
        await page.goto(url);
        await dark(page, true);
        await expect(
            page.getByRole('radiogroup', { name: 'Appearance' }),
        ).toHaveCount(0);
    }
    await page.goto('/settings/appearance');
    await choose(page, 'Light');
    await dark(page, false);
    await page.reload();
    await dark(page, false);
    await page.screenshot({
        path: info.outputPath('appearance-only-settings-light.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await choose(page, 'System');
    await page.emulateMedia({ colorScheme: 'dark' });
    await dark(page, true);
    await expect(
        page.getByRole('status').filter({ hasText: 'Currently displaying' }),
    ).toContainText('Dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await dark(page, false);
    await choose(page, 'Dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await dark(page, true);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/login');
    await dark(page, true);
    await expect(
        page.getByRole('radiogroup', { name: 'Appearance' }),
    ).toHaveCount(0);
    await page.goto('/forgot-password');
    await dark(page, true);
    await expect(
        page.getByRole('radiogroup', { name: 'Appearance' }),
    ).toHaveCount(0);
    await login(page);
    await dark(page, true);
});

test('guest first paint retains saved theme and sidebar state without exposing controls', async ({
    page,
    context,
}) => {
    await context.addCookies([
        {
            name: 'appearance',
            value: 'light',
            url: process.env.E2E_BASE_URL || 'http://127.0.0.1:8001',
        },
    ]);
    await page.addInitScript(() => {
        localStorage.setItem('appearance', 'dark');
        localStorage.setItem('skybound.sidebar.collapsed', 'true');
    });
    await page.route('**/*.js', (route) => route.abort());
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await dark(page, true);
    await expect(page.locator('html')).toHaveAttribute(
        'data-sidebar-collapsed',
        'true',
    );
});

test('blocked storage does not prevent login rendering', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
        Storage.prototype.getItem = () => {
            throw new Error('Blocked storage');
        };
        Storage.prototype.setItem = () => {
            throw new Error('Blocked storage');
        };
    });
    await page.goto('/login');
    await expect(
        page.getByRole('heading', { name: 'Sign in to your workspace' }),
    ).toBeVisible();
    await expect(
        page.getByRole('radiogroup', { name: 'Appearance' }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
});
