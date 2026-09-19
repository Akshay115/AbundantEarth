import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

// Original assets published by AEF. The favicon source is already symbol-only: no text is recreated.
const logoSource = 'https://abundantearthfoundation.org/wp-content/uploads/2023/06/AEF-website-regina-logo.png';
const symbolSource = 'https://abundantearthfoundation.org/wp-content/uploads/2020/12/logo-AEF-only.png';
async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Brand asset download failed: ${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
const [logo, symbol] = await Promise.all([download(logoSource), download(symbolSource)]);
await mkdir('public/images/brand', { recursive: true });
const info = await sharp(logo).trim({ background: '#ffffff', threshold: 5 }).resize({ width: 640, withoutEnlargement: true }).png().toFile('public/images/brand/logo.png');
const cleanSymbol = await sharp(symbol).trim().png().toBuffer();
await writeFile('public/images/brand/symbol.png', cleanSymbol);
async function icon(size, padding, background = '#00000000') {
  const mark = await sharp(cleanSymbol).resize({ width: size - padding * 2, height: size - padding * 2, fit: 'inside' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } }).composite([{ input: mark, gravity: 'centre' }]).png().toBuffer();
}
const png16 = await icon(16, 1);
const png32 = await icon(32, 2);
const png128 = await icon(128, 6);
await writeFile('public/favicon-16x16.png', png16);
await writeFile('public/favicon-32x32.png', png32);
await writeFile('public/apple-touch-icon.png', await icon(180, 16, '#faf8f1'));
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><image width="128" height="128" href="data:image/png;base64,${png128.toString('base64')}"/></svg>\n`);

// PNG-backed ICO entries for browsers requesting /favicon.ico directly.
const entries = [{ size: 16, data: png16 }, { size: 32, data: png32 }];
const directory = Buffer.alloc(6 + entries.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(entries.length, 4);
let offset = directory.length;
entries.forEach(({ size, data }, index) => {
  const start = 6 + index * 16;
  directory[start] = size; directory[start + 1] = size;
  directory.writeUInt16LE(1, start + 4); directory.writeUInt16LE(32, start + 6);
  directory.writeUInt32LE(data.length, start + 8); directory.writeUInt32LE(offset, start + 12);
  offset += data.length;
});
await writeFile('public/favicon.ico', Buffer.concat([directory, ...entries.map(entry => entry.data)]));
await writeFile('src/data/brand.json', JSON.stringify({ name: 'Abundant Earth Foundation', logo: '/images/brand/logo.png', width: info.width, height: info.height, symbol: '/images/brand/symbol.png', logoSource, symbolSource }, null, 2) + '\n');
console.log(`Prepared original logo (${info.width} × ${info.height}) and text-free SVG, PNG, ICO, and Apple touch icons.`);
