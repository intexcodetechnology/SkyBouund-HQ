import { test, expect } from '@playwright/test';
import { login } from './support/login';

test('sidebar toggle persists, adjusts content and keeps navigation and tooltips working', async ({
    page,
}, info) => {
    await login(page);
    const sidebar = page.locator('#workspace-sidebar');
    const main = page.locator('.hq-main');
    await expect(sidebar).toHaveCSS('width', '256px');
    await expect(main).toHaveCSS('margin-left', '256px');
    await page
        .getByRole('button', { name: 'Collapse sidebar', exact: true })
        .click();
    await expect(sidebar).toHaveCSS('width', '72px');
    await expect(main).toHaveCSS('margin-left', '72px');
    await expect(page.locator('.hq-logo')).toBeVisible();
    await expect(page.locator('.hq-brand strong')).toBeHidden();
    expect(
        await page.evaluate(() =>
            localStorage.getItem('skybound.sidebar.collapsed'),
        ),
    ).toBe('true');
    const customers = page.getByRole('link', {
        name: 'Customer Database',
        exact: true,
    });
    await customers.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Customer Database');
    await customers.click();
    await expect(
        page
            .getByRole('heading', { name: 'Customer Database', exact: true })
            .first(),
    ).toBeVisible();
    await expect(customers).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(sidebar).toHaveCSS('width', '72px');
    await page.screenshot({
        path: info.outputPath('sidebar-collapsed.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await page
        .getByRole('button', { name: 'Expand sidebar', exact: true })
        .click();
    await expect(sidebar).toHaveCSS('width', '256px');
    await expect(main).toHaveCSS('margin-left', '256px');
    await expect(page.locator('.hq-brand strong')).toBeVisible();
    await page.reload();
    await expect(sidebar).toHaveCSS('width', '256px');
    await expect(
        page.locator('.hq-sidebar').getByRole('radiogroup'),
    ).toHaveCount(0);
    await page.screenshot({
        path: info.outputPath('sidebar-expanded.png'),
        fullPage: true,
        animations: 'disabled',
    });
});

test('tablet and mobile remain responsive without resetting desktop or theme preferences', async ({
    page,
}, info) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await login(page);
    const sidebar = page.locator('#workspace-sidebar');
    await expect(sidebar).toHaveCSS('width', '72px');
    await page
        .getByRole('button', { name: 'Expand sidebar', exact: true })
        .click();
    await expect(sidebar).toHaveCSS('width', '256px');
    await page.reload();
    await expect(sidebar).toHaveCSS('width', '256px');
    await page
        .getByRole('button', { name: 'Collapse sidebar', exact: true })
        .click();
    await page.goto('/settings/appearance');
    await page.getByRole('radio', { name: 'Dark', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(sidebar).not.toBeInViewport();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(sidebar).toBeInViewport();
    await expect(sidebar).toHaveCSS('width', '256px');
    await expect(page.locator('.hq-brand strong')).toBeVisible();
    await expect(sidebar.getByRole('radiogroup')).toHaveCount(0);
    await page.screenshot({
        path: info.outputPath('sidebar-mobile.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await page
        .getByRole('button', { name: 'Close sidebar', exact: true })
        .click();
    await expect(sidebar).not.toBeInViewport();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page
        .getByRole('link', { name: 'Account settings', exact: true })
        .click();
    await page.waitForURL('**/settings/profile');
    await expect(sidebar).not.toBeInViewport();
    await page.getByRole('link', { name: 'Appearance', exact: true }).click();
    await expect(
        page.getByRole('radiogroup', { name: 'Appearance' }),
    ).toHaveCount(1);
    await expect(
        page.getByRole('radio', { name: 'Dark', exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
        await page.evaluate(() =>
            localStorage.getItem('skybound.sidebar.collapsed'),
        ),
    ).toBe('true');
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(sidebar).toHaveCSS('width', '72px');
    await expect(page.locator('html')).toHaveClass(/dark/);
});
