import { mkdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import sharp from 'sharp';

// Public project photography. Attribution and release-review notes are in docs/CONTENT.md.
const media = {
  'food-forest': 'https://agroforestryrc.org/wp-content/uploads/2021/12/After-September-2021-Contour-Lines_1920.jpg',
  'forest-before': 'https://agroforestryrc.org/wp-content/uploads/2021/12/Before-February-2019-Contour-Lines_1920.jpg',
  'training': 'https://agroforestryrc.org/wp-content/uploads/2022/03/Roland-homepg-scaled.jpg',
  'gardens': 'https://agroforestryrc.org/wp-content/uploads/2022/03/patrick-homepg-scaled.jpg',
  'seedlings': 'https://agroforestryrc.org/wp-content/uploads/2021/12/Permaculture-Paradise_Seedlings.jpg',
  'community': 'https://web.archive.org/web/20250812100538im_/https://abundantearthfoundation.org/wp-content/uploads/2023/05/IMG_0192-150x150.jpg',
  'education': 'https://www.eco-designers.com/uploads/1/1/8/6/11866315/students-observing-plants-on-pots-1.jpeg',
  'youth': 'https://web.archive.org/web/20250812100538im_/https://abundantearthfoundation.org/wp-content/uploads/2023/05/Nakafeero-Brenda-2022.jpg',
  'hannah': 'https://agroforestryrc.org/wp-content/uploads/2021/12/HAE-headshot-in-green_1200.jpg',
};
await mkdir('public/images', { recursive: true });
for (const [name, url] of Object.entries(media)) {
  if (process.argv.length > 2 && !process.argv.slice(2).includes(name)) continue;
  // Prefer full-resolution originals when they are archived; retain a known captured fallback.
  const original = url.replace('-150x150', '');
  let buffer;
  for (const candidate of [...new Set([original, url])]) {
    try {
      const response = await fetch(candidate, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      await sharp(bytes).metadata();
      buffer = bytes;
      break;
    } catch (error) { console.warn(`${name}: ${error.message}`); }
  }
  if (!buffer) throw new Error(`Unable to download ${name}; do not replace with unrelated stock imagery.`);
  for (const width of [480, 960, 1600]) {
    const output = await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    await writeFile(`public/images/${name}-${width}.webp`, output);
  }
  console.log(`Prepared ${name}`);
}
