import { test } from 'node:test';
import assert from 'node:assert/strict';
import { httpsUrl, emailDraft, givingDestination } from '../src/lib/integrations.mjs';

test('unconfigured providers remain unavailable instead of getting an invented destination', () => {
  assert.equal(httpsUrl(''), '');
  assert.equal(httpsUrl(undefined), '');
  assert.equal(httpsUrl('   '), '');
});
test('provider URLs reject executable URLs, plaintext HTTP, and embedded credentials', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.org', 'https://user:secret@example.org', 'not-a-url']) assert.throws(() => httpsUrl(value));
  assert.equal(httpsUrl('https://example.org/checkout?fund=earth'), 'https://example.org/checkout?fund=earth');
});
test('email drafts safely encode ampersands, newlines, and Unicode without creating extra headers', () => {
  const draft = emailDraft('info@example.org', 'Giving & learning\nBcc: unwanted@example.org', 'Hello\nA garden & a forest 🌱');
  const url = new URL(draft);
  assert.equal(url.searchParams.get('subject'), 'Giving & learning\nBcc: unwanted@example.org');
  assert.equal(url.searchParams.get('body'), 'Hello\nA garden & a forest 🌱');
  assert.equal(url.searchParams.size, 2);
});

test('project-specific and monthly giving never falls back silently to another fund or frequency', () => {
  const options = { oneTimeUrl: 'https://example.org/general', monthlyUrl: 'https://example.org/monthly', projectUrls: [{ slug: 'forest', oneTimeUrl: 'https://example.org/forest', monthlyUrl: '' }] };
  assert.equal(givingDestination({ ...options, project: '', monthly: false }), options.oneTimeUrl);
  assert.equal(givingDestination({ ...options, project: '', monthly: true }), options.monthlyUrl);
  assert.equal(givingDestination({ ...options, project: 'forest', monthly: false }), 'https://example.org/forest');
  assert.equal(givingDestination({ ...options, project: 'forest', monthly: true }), '');
  assert.equal(givingDestination({ ...options, project: 'missing', monthly: false }), '');
});
