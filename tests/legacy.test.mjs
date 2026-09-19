import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderLegacyHtml } from '../src/lib/legacy.ts';
import manifest from '../docs/migration-manifest.json' with { type: 'json' };
import history from '../src/data/legacy-history.json' with { type: 'json' };
import pages from '../src/data/legacy-pages.json' with { type: 'json' };
import projects from '../src/data/legacy-projects.json' with { type: 'json' };
import stories from '../src/data/stories.json' with { type: 'json' };

test('legacy HTML cannot introduce active scripts, unsafe URLs, events, or embedded forms', () => {
  const html = renderLegacyHtml('<script>alert(1)</script><iframe src="https://example.org"></iframe><form action="https://example.org"><input name="secret"></form><a href="javascript:alert(1)" onclick="alert(1)">Link</a><img src="/images/test.webp" alt="A garden" onerror="alert(1)"><h1>Title</h1>');
  for (const unsafe of ['<script', '<iframe', '<form', '<input', 'javascript:', 'onclick', 'onerror', '<h1']) assert.ok(!html.includes(unsafe));
  assert.ok(html.includes('A garden'));
  assert.ok(html.includes('<h2>Title</h2>'));
});
test('project references migrate to their new route, while excluded editorial links remain external', () => {
  const html = renderLegacyHtml('<a href="https://abundantearthfoundation.org/tge/">Project</a><a href="https://abundantearthfoundation.org/articles/biomimicry/">Article</a>');
  assert.ok(html.includes('href="/projects/towards-green-environment/"'));
  assert.ok(html.includes('href="https://abundantearthfoundation.org/articles/biomimicry/"'));
});
test('the full public page inventory is accounted for without transferring old blog articles', () => {
  assert.equal(manifest.pages.length, 65);
  assert.equal(manifest.campaigns.length, 34);
  assert.equal(manifest.excludedBlogUrls.length, 28);
  assert.deepEqual(stories.map(s => s.slug), ['food-forests-and-local-leadership', 'young-people-growing-change', 'learning-to-design-a-healthier-world']);
  for (const url of manifest.excludedBlogUrls) assert.ok(![...pages, ...projects].some(p => p.source === url));
  assert.equal(history.filter(h => h.youth).length, 23);
});
test('project narratives inside GiveWP wrappers survive the migration', () => {
  const love = projects.find(p => p.slug === 'love-letters');
  assert.ok(love.bodyHtml.includes('Lost Art of Love Letters'));
  assert.ok(love.bodyHtml.includes('January of 2016'));
  assert.ok(pages.find(p => p.path === '/resources/videos/').bodyHtml.includes('youtu'));
});
