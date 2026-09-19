import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { renderLegacyHtml } from '../src/lib/legacy.ts';
import { imageDimensions, reserveImageSpace } from '../src/lib/image-dimensions.ts';

test('layout normalization preserves narrative text and image links while forming paragraphs and a gallery', () => {
  const text = 'Local people share practical knowledge to help their communities grow healthy food and care for living landscapes. '.repeat(10);
  const input = `<h2>Project account</h2><i>An introduction.</i> ${text}<figure><a href="https://example.org/one"><img src="/images/one.webp" alt="First"></a></figure><figure><img src="/images/two.webp" alt="Second"></figure>`;
  const html = renderLegacyHtml(input);
  const $ = load(html);
  assert.ok($('p').length > 2);
  assert.equal($('.source-gallery img').length, 2);
  assert.equal($('a').attr('href'), 'https://example.org/one');
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  assert.equal(normalize($.text()), normalize(load(input).text()));
});

test('team portraits stay with their biographies and shared closing copy stays outside the cards', () => {
  const $ = load(renderLegacyHtml('<p>Meet our team</p><figure><img src="/images/one.webp" alt="One"></figure><h3>One</h3><p>Founder</p><p>First biography.</p><figure><img src="/images/two.webp" alt="Two"></figure><h3>Two</h3><p>Coordinator</p><p>Second biography.</p><p>By joining together, we can grow.</p>', 'team'));
  assert.equal($('.team-profile').length, 2);
  assert.equal($('.team-profile').first().find('img').attr('alt'), 'One');
  assert.equal($('.team-profile').last().find('img').attr('alt'), 'Two');
  assert.ok($('.team-profile').first().text().includes('First biography.'));
  assert.ok($('.team-profile').last().text().includes('Second biography.'));
  assert.ok(!$('.team-profiles').text().includes('By joining together'));
  assert.ok($.text().includes('By joining together'));
});

test('source acknowledgments are collapsible without losing names, dates, or amounts', () => {
  const $ = load(renderLegacyHtml('<h2>Project</h2><p>Account.</p><h2>Current Donors – Thank you!</h2><h3>Example donor</h3><p>May 23, 2026</p>Amount Donated $10.00<h2>Next section</h2>'));
  const details = $('details.source-acknowledgments');
  assert.equal(details.length, 1);
  assert.equal(details.attr('open'), undefined);
  for (const text of ['Example donor', 'May 23, 2026', '$10.00', 'Current Donors']) assert.ok(details.text().includes(text));
  assert.ok(!details.text().includes('Next section'));
});

test('rich images reserve real dimensions and metadata lookup cannot escape public images', async () => {
  const $ = load(await reserveImageSpace('<img src="/images/food-forest-480.webp" alt="Food forest">'));
  assert.equal($('img').attr('width'), '480');
  assert.ok(Number($('img').attr('height')) > 0);
  assert.throws(() => imageDimensions('/images/../../README.md'));
});
