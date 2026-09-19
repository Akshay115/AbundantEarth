import { test, expect } from '@playwright/test';
import manifest from '../../docs/migration-manifest.json' with { type: 'json' };

test('history filter includes all youth recipients, explains missing coordinates, and resets the map', async ({ page }) => {
  await page.goto('/history/?type=youth');
  await expect(page.locator('[data-history-record]:visible')).toHaveCount(23);
  await expect(page.locator('#map-unavailable')).toBeVisible();
  await page.getByLabel('Year').selectOption('2022');
  await expect(page.locator('[data-history-record]:visible')).toHaveCount(10);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('[data-history-record]:visible')).toHaveCount(98);
  await expect(page.locator('.map-scroll')).toBeVisible();
  await page.getByRole('button', { name: 'Zoom into map' }).click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('style', /1.5/);
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('style', /1;/);
});

test('site-wide search finds imported resources and never renders excluded blog posts', async ({ page, request }) => {
  await page.goto('/search/?q=Ecoversities');
  await expect(page.locator('#search-results a[href="/projects/ecoversities/"]')).toBeVisible();
  await page.getByLabel('Search the site', { exact: true }).fill('unfindable-xyz-123');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('#search-status')).toHaveText('0 results found.');
  const response = await request.get('/search-index.json');
  const data = await response.json();
  for (const url of manifest.excludedBlogUrls) expect(data.some((r: { url: string }) => r.url.endsWith(new URL(url).pathname))).toBe(false);
  await page.goto('/stories/');
  await expect(page.locator('.story-card')).toHaveCount(3);
});

test('current source information and upstream newsletter failure are explicit', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.stat').first()).toContainText('200+');
  await page.goto('/get-support/');
  await expect(page.locator('.notice').first()).toContainText('closed');
  await page.goto('/newsletter/');
  await expect(page.getByText('The original signup destination is unavailable.')).toBeVisible();
  await page.goto('/donation-success-page/');
  await expect(page).toHaveURL(/donor-support\/#payment-status/);
  await expect(page.locator('main')).toContainText('This page does not confirm a payment');
});

test('source-published project checkout handoff keeps the selected fund', async ({ page }) => {
  await page.route('https://secure.givelively.org/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Provider intercepted for test</h1>' }));
  await page.goto('/donate/?project=ancient-cacao');
  await page.getByRole('button', { name: 'Continue to secure checkout' }).click();
  await expect(page).toHaveURL('https://secure.givelively.org/donate/abundant-earth-foundation/ancient-cacao');
});
