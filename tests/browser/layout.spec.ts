import { test, expect } from '@playwright/test';

test('landscape navigation stays inside the screen and can scroll to the final action', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 360 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link', { name: 'Search the site' })).toBeVisible();
  const bounds = await nav.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(360);
  const donation = nav.getByRole('link', { name: 'Donate' });
  await donation.focus();
  const action = await donation.boundingBox();
  expect(action!.y + action!.height).toBeLessThanOrEqual(360);
});

test('320px layouts keep navigation, long titles, and controls inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of ['/', '/projects/', '/resources/', '/history/nyathuongweno-community-permaculture-project-kenya-2021/', '/donate/']) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(await page.locator('h1').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const menu = page.getByRole('button', { name: 'Open navigation' });
    const bounds = await menu.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});

test('tablet forms and reading columns stack with usable input sizing', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  for (const path of ['/contact/', '/donate/', '/resources/podcasts/']) {
    await page.goto(path);
    const columns = page.locator('main .two-column, main .article-grid').first();
    const first = await columns.locator(':scope > *').nth(0).boundingBox();
    const second = await columns.locator(':scope > *').nth(1).boundingBox();
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
    expect(Math.abs(second!.x - first!.x)).toBeLessThan(2);
    expect(await page.locator('input:not([type="radio"]):not([type="checkbox"]), select, textarea').evaluateAll(fields => fields.every(field => parseFloat(getComputedStyle(field).fontSize) >= 16))).toBe(true);
  }
});

test('imported media and biographies have stable, accessible layouts', async ({ page }) => {
  await page.goto('/projects/ancient-cacao/');
  await expect(page.locator('.source-gallery').first()).toBeVisible();
  expect(await page.locator('.legacy-content img').evaluateAll(images => images.every(img => Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0))).toBe(true);
  await expect(page.locator('.project-hero figure img')).toHaveCSS('object-fit', 'contain');
  const appendix = page.locator('details.source-acknowledgments');
  await expect(appendix).not.toHaveAttribute('open', '');
  await appendix.locator('summary').click();
  await expect(appendix).toHaveAttribute('open', '');
  await page.goto('/about/');
  await expect(page.locator('.team-profile')).toHaveCount(2);
  await expect(page.locator('.team-profile').first()).toContainText('Hannah Eckberg');
  await expect(page.locator('.team-profile').last()).toContainText('Alexa Bernard');
});
