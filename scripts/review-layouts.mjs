import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

// Visual-review artifacts live outside the repository. Run against a built preview.
const base = process.env.LAYOUT_BASE_URL || 'http://127.0.0.1:4321';
const output = process.env.LAYOUT_REVIEW_DIR || '/tmp/opencode/aef-layout-review';
const widths = [320, 390, 768, 1024, 1440];
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const capture = new Set(['/', '/about/', '/projects/', '/projects/ancient-cacao/', '/projects/ecoversities/', '/projects/love-letters/', '/history/', '/history/grants/', '/resources/podcasts/', '/donate/', '/contact/', '/financials/', '/internships/project-administration/', '/stories/food-forests-and-local-leadership/']);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  await Promise.all(widths.map(async width => {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    for (const path of paths) {
      await page.goto(`${base}${path}`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => {
        const visible = el => el.getClientRects().length > 0;
        const describe = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().replaceAll(' ', '.') : ''}`;
        const overflow = [...document.querySelectorAll('main *, .site-header *, .site-footer *')].filter(el => {
          if (!visible(el) || el.closest('.map-scroll, .sr-only')) return false;
          const rect = el.getBoundingClientRect();
          return rect.left < -2 || rect.right > innerWidth + 2;
        }).map(el => ({ element: describe(el), text: el.textContent.trim().slice(0, 75), width: Math.round(el.getBoundingClientRect().width) }));
        const clipped = [...document.querySelectorAll('h1,h2,h3,p,button,.button,label')].filter(el => visible(el) && !el.closest('.sr-only') && el.scrollWidth > el.clientWidth + 3 && getComputedStyle(el).display !== 'inline').map(describe);
        const squeezed = [...document.querySelectorAll('.two-column > *, .article-grid > *, .hero-grid > *')].filter(el => visible(el) && innerWidth > 700 && el.getBoundingClientRect().width < 250).map(el => ({ element: describe(el), width: Math.round(el.getBoundingClientRect().width) }));
        return { pageWidth: document.documentElement.scrollWidth, overflow: overflow.slice(0, 10), clipped, squeezed };
      });
      results.push({ path, width, ...result });
      if (capture.has(path) && [320, 768, 1440].includes(width)) {
        const name = path === '/' ? 'home' : path.replaceAll('/', '_');
        await page.screenshot({ path: `${output}/${name}-${width}.png` });
        const body = page.locator('.article-grid, .two-column, #team').last();
        if (await body.count()) { await body.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/${name}-${width}-body.png` }); }
      }
    }
    await page.close();
  }));
} finally { await browser.close(); }
const issues = results.filter(r => r.pageWidth > r.width + 1 || r.overflow.length || r.clipped.length || r.squeezed.length);
await writeFile(`${output}/report.json`, JSON.stringify({ reviewed: results.length, paths: paths.length, widths, issues }, null, 2));
console.log(JSON.stringify({ reviewed: results.length, pages: paths.length, widths, issues: issues.length, report: `${output}/report.json`, samples: issues.slice(0, 20) }, null, 2));
if (issues.length) process.exitCode = 1;
