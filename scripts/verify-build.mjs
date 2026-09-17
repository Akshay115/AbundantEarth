import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';
import projects from '../src/data/projects.json' with { type: 'json' };
import stories from '../src/data/stories.json' with { type: 'json' };
import redirects from '../src/data/redirects.json' with { type: 'json' };
import integrations from '../src/data/integrations.json' with { type: 'json' };
import { httpsUrl } from '../src/lib/integrations.mjs';

const root = 'dist';
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
}
const files = await walk(root);
const fileSet = new Set(files.map(file => relative(root, file)));
const errors = [];
const content = new Map();
for (const file of files.filter(file => file.endsWith('.html'))) content.set(relative(root, file), await readFile(file, 'utf8'));

const slugs = projects.map(p => p.slug);
assert.equal(new Set(slugs).size, slugs.length, 'Project slugs must be unique');
assert.equal(new Set(stories.map(s => s.slug)).size, stories.length, 'Story slugs must be unique');
for (const project of projects) {
  assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Project slug must be URL-safe');
  assert.ok(project.source && project.outcomeNote && project.status && project.imageCaption, `Missing provenance: ${project.slug}`);
}
for (const story of stories) assert.ok(slugs.includes(story.project), `Unknown project in ${story.slug}`);
for (const item of integrations.projectDonationUrls) {
  assert.ok(slugs.includes(item.slug), `Unknown checkout project: ${item.slug}`);
  httpsUrl(item.oneTimeUrl); httpsUrl(item.monthlyUrl);
}
for (const key of ['donationUrl', 'monthlyDonationUrl', 'newsletterUrl']) httpsUrl(integrations[key]);

const site = 'https://abundantearthfoundation.org';
function targetFile(pathname) {
  const path = decodeURIComponent(pathname).replace(/^\//, '');
  if (fileSet.has(path)) return path;
  const index = `${path.replace(/\/$/, '')}${path ? '/' : ''}index.html`;
  return fileSet.has(index) ? index : null;
}
for (const [file, html] of content) {
  const redirect = /http-equiv="refresh"/i.test(html);
  if (!redirect) {
    if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${file}: expected exactly one h1`);
    for (const required of ['name="description"', 'rel="canonical"', 'id="main"', 'lang="en"']) if (!html.includes(required)) errors.push(`${file}: missing ${required}`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (!raw.startsWith('/') && !raw.startsWith('#')) continue;
    if (raw.startsWith('//')) continue;
    const currentPath = `/${file.replace(/index\.html$/, '').replace(/^index\.html$/, '')}`;
    const url = new URL(raw, new URL(currentPath, site));
    const target = targetFile(url.pathname);
    if (!target) { errors.push(`${file}: missing local target ${raw}`); continue; }
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!content.get(target)?.includes(`id="${id}"`)) errors.push(`${file}: missing anchor ${raw}`);
    }
  }
}
for (const [from, to] of Object.entries(redirects)) {
  if (!targetFile(new URL(to, site).pathname)) errors.push(`Redirect ${from} has missing target ${to}`);
}
// Hosts supporting _redirects get real HTTP 301s; generated HTML handles other static hosts.
await writeFile(join(root, '_redirects'), Object.entries(redirects).map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n');
await writeFile(join(root, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n');
const total = (await Promise.all(files.map(file => stat(file)))).reduce((sum, file) => sum + file.size, 0);
assert.deepEqual(errors, [], `Build verification failed:\n${errors.join('\n')}`);
console.log(`Verified ${content.size} HTML files, all local links/anchors, project references, and ${Object.keys(redirects).length} legacy redirects. Static output: ${(total / 1024 / 1024).toFixed(2)} MB.`);
