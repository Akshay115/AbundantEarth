import sharp from 'sharp';
import { resolve, sep } from 'node:path';
import { load } from 'cheerio';

const root = resolve('public');
const metadata = new Map<string, Promise<{ width: number; height: number }>>();
export function imageDimensions(src: string) {
  const file = resolve(root, '.' + src);
  if (!src.startsWith('/images/') || !file.startsWith(root + sep)) throw new Error(`Expected a local public image: ${src}`);
  if (!metadata.has(src)) metadata.set(src, sharp(file).metadata().then(info => {
    if (!info.width || !info.height) throw new Error(`Missing image dimensions: ${src}`);
    return { width: info.width, height: info.height };
  }));
  return metadata.get(src)!;
}

export async function reserveImageSpace(html: string) {
  const $ = load(html, null, false);
  await Promise.all($('img').toArray().map(async image => {
    const src = $(image).attr('src') || '';
    if (!src.startsWith('/images/')) return;
    const { width, height } = await imageDimensions(src);
    $(image).attr({ width: String(width), height: String(height), decoding: 'async' });
  }));
  return $.html();
}
