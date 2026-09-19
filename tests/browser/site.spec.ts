import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import baseProjects from '../../src/data/projects.json' with { type: 'json' };
import importedProjects from '../../src/data/legacy-projects.json' with { type: 'json' };
import legacyPages from '../../src/data/legacy-pages.json' with { type: 'json' };
import stories from '../../src/data/stories.json' with { type: 'json' };

const projects = [...baseProjects, ...importedProjects];
const pages = ['/', '/about/', '/projects/', '/impact/', '/get-involved/', '/get-support/', '/volunteer/', '/partnerships/', '/fiscal-sponsorship/', '/donate/', '/newsletter/', '/contact/', '/financials/', '/stories/', '/resources/', '/privacy/', '/accessibility/', '/sources/', '/history/', '/history/grants/', '/history/brenda-nakafeero-kitgum-uganda-2022/', '/search/', '/campaigns/', '/report-impact/', '/donor-support/', '/resources/newsletters/', ...legacyPages.map(p => p.path), ...projects.map(p => `/projects/${p.slug}/`), ...stories.map(s => `/stories/${s.slug}/`)];

for (const path of pages) {
  test(`page, layout, and accessibility: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('project filters combine, persist in URL, and have an accessible empty state', async ({ page }) => {
  await page.goto('/projects/?country=Kenya');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(projects.filter(p => p.countries.includes('Kenya')).length);
  await page.getByLabel('Focus area').selectOption('Community resilience');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/theme=Community\+resilience/);
  await page.getByLabel('Find a project').fill('no-matching-project');
  await expect(page.getByRole('heading', { name: 'No projects found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all projects' }).click();
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(projects.length);
  await expect(page.getByLabel('Find a project')).toBeFocused();
});

test('inquiries validate and prepare a draft without sending or storing personal data', async ({ page }) => {
  await page.goto('/contact/?topic=Project%20update&project=refarmers');
  const submissions: string[] = [];
  page.on('request', request => { if (request.method() !== 'GET') submissions.push(request.url()); });
  await page.getByRole('button', { name: 'Prepare my email' }).click();
  await expect(page.locator('[data-draft-result]')).toBeHidden();
  await page.getByLabel('Your name', { exact: true }).fill('River & Forest');
  await page.getByLabel('Email address', { exact: true }).fill('river@example.org');
  await page.getByLabel('Your message', { exact: true }).fill('I would like to share a community garden update.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Prepare my email' }).click();
  await expect(page.locator('[data-draft-result]')).toBeVisible();
  const href = await page.getByRole('link', { name: 'Open email app' }).getAttribute('href');
  expect(new URL(href!).searchParams.get('body')).toContain('Project / organization: refarmers');
  expect(new URL(href!).searchParams.get('subject')).toContain('Project update');
  expect(submissions).toEqual([]);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});

test('project-specific recurring giving has an honest, useful unconfigured state', async ({ page }) => {
  await page.goto('/donate/?project=refarmers&frequency=monthly');
  await expect(page.getByLabel('Monthly', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Area of interest')).toHaveValue('refarmers');
  await expect(page.locator('#giving-availability')).toContainText('not connected');
  await page.getByRole('button', { name: 'Prepare a giving inquiry' }).click();
  await expect(page.locator('#giving-result')).toContainText('No donation has been made');
  await expect(page.locator('#giving-preview')).toHaveValue(/monthly giving/);
  await page.getByLabel('One time', { exact: true }).check();
  await expect(page.locator('#giving-result')).toBeHidden();
});

test('legacy project donation link preserves project selection', async ({ page }) => {
  await page.goto('/donations/donate-to-agroforestry-regeneration-communities/');
  await expect(page).toHaveURL(/\/donate\/\?project=agroforestry-regeneration-communities/);
  await expect(page.getByLabel('Area of interest')).toHaveValue('agroforestry-regeneration-communities');
});

test('navigation works with keyboard and closes on Escape', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  if (testInfo.project.name === 'mobile') {
    const menu = page.getByRole('button', { name: 'Open navigation' });
    await menu.click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    await menu.click();
  }
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Our work' }).click();
  await expect(page).toHaveURL('/projects/');
});

test('content and provider alternatives remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/projects/');
  await expect(page.locator('[data-project-card]')).toHaveCount(projects.length);
  await page.goto('http://127.0.0.1:4322/donate/');
  await expect(page.getByRole('link', { name: 'Visit the verified donation provider' })).toBeVisible();
  await context.close();
});

test('unknown pages return a useful 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /back to the roots/ })).toBeVisible();
});

test('no broken local images on the homepage', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.locator('img').evaluateAll(images => images.forEach(img => { if (img instanceof HTMLImageElement) img.loading = 'eager'; }));
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0))).toBe(true);
});
