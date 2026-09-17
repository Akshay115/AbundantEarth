import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://example.org/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Intercepted provider handoff</h1>' }));
});

test('configured general checkout honors frequency and never sends payment data', async ({ page }) => {
  await page.goto('/donate/');
  await page.getByRole('button', { name: 'Continue to secure checkout' }).click();
  await expect(page).toHaveURL('https://example.org/aef-once');
  await page.goto('/donate/?frequency=monthly');
  await page.getByRole('button', { name: 'Continue to secure checkout' }).click();
  await expect(page).toHaveURL('https://example.org/aef-monthly');
});

test('general checkout does not swallow an unconfigured project-specific gift', async ({ page }) => {
  await page.goto('/donate/?project=refarmers');
  await expect(page.getByRole('button', { name: 'Prepare a giving inquiry' })).toBeVisible();
  await expect(page.locator('#giving-availability')).toContainText('not connected');
});

test('configured newsletter opens the provider without claiming a completed subscription', async ({ page }) => {
  await page.goto('/newsletter/');
  await expect(page.locator('[data-inquiry]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Go to newsletter signup' }).click();
  await expect(page).toHaveURL('https://example.org/aef-newsletter');
});
