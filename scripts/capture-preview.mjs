import { chromium } from '@playwright/test';
import sharp from 'sharp';
import process from 'node:process';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch();
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(async img => { img.loading = 'eager'; await img.decode().catch(() => {}); }));
    });
    const capture = await page.screenshot({ fullPage: true });
    await sharp(capture).webp({ quality: 82 }).toFile(`docs/screenshots/home-${name}.webp`);
    console.log(`Captured ${name}`);
    await page.close();
  }
} finally { await browser.close(); }
