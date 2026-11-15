import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { totp } from './support/totp';

test('administrator completes TOTP and manages customers, products, tasks and reports', async ({
    page,
}, testInfo) => {
    const credentials = JSON.parse(
        readFileSync(
            process.env.E2E_CREDENTIALS_FILE || '.local/e2e-login.json',
            'utf8',
        ),
    ) as { email: string; password: string; secret: string };
    const name = `QA Customer ${Date.now()}`;
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
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
    await expect(
        page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    await page
        .getByRole('link', { name: 'Customer Database', exact: true })
        .click();
    await page.getByRole('button', { name: 'Add Customer' }).click();
    await page.getByLabel('Customer name', { exact: true }).fill(name);
    await page.getByLabel('Phone (international format)').fill('+60123456789');
    await page.getByLabel('IC number (optional)').fill('900101101234');
    await page.getByLabel('Existing product / model').fill('QA Existing Model');
    await page
        .getByRole('button', { name: 'Save Customer', exact: true })
        .click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: name })
            .getByText('••••••••1234'),
    ).toBeVisible();
    await expect(page.getByText('900101101234', { exact: true })).toHaveCount(
        0,
    );
    await page
        .getByRole('button', { name: `Edit ${name}`, exact: true })
        .click();
    await page
        .getByLabel('Latest lead remark')
        .fill('QA verified profile save.');
    await page
        .getByRole('button', { name: 'Save Customer', exact: true })
        .click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.screenshot({
        path: testInfo.outputPath('customers-desktop.png'),
        fullPage: true,
    });

    await page
        .getByRole('link', { name: 'Product Catalog', exact: true })
        .click();
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.getByLabel('Category', { exact: true }).fill('Water Purifiers');
    await page.getByLabel('Model name').fill('QA Water Model');
    await page.getByLabel('Model code').fill(`QA-${Date.now()}`);
    await page.getByLabel('Monthly price (MYR)').fill('77.00');
    await page.getByRole('button', { name: 'Save Product' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(
        page.getByText('QA Water Model', { exact: true }).first(),
    ).toBeVisible();

    await page
        .getByRole('link', { name: 'Task Management', exact: true })
        .click();
    await page.getByRole('button', { name: 'Assign Task' }).click();
    await page.getByLabel('Task title').fill(`Follow up ${name}`);
    await page.getByLabel('Customer lead').selectOption({ label: name });
    await page
        .getByLabel('Assigned to', { exact: true })
        .selectOption({ label: 'Browser Test Administrator' });
    await page.getByLabel('Due date', { exact: true }).fill('2026-11-20');
    await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Assign Task', exact: true })
        .click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page
        .getByLabel(`Status for Follow up ${name}`)
        .selectOption('completed');
    await expect(page.getByLabel(`Status for Follow up ${name}`)).toHaveValue(
        'completed',
    );

    await page
        .getByRole('link', { name: 'Reports & Analytics', exact: true })
        .click();
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download CSV' }).click();
    expect((await download).suggestedFilename()).toBe('skybound-customers.csv');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(
        page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    await page.screenshot({
        path: testInfo.outputPath('dashboard-desktop.png'),
        fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page
        .getByRole('link', { name: 'Auto Dialing', exact: false })
        .click();
    await expect(
        page.getByText('Telephony not connected.', { exact: true }),
    ).toBeVisible();
    await page.screenshot({
        path: testInfo.outputPath('workspace-mobile.png'),
        fullPage: true,
    });
    expect(errors).toEqual([]);
});
