import { load } from 'cheerio';
import sanitize from 'sanitize-html';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { worldSvg } from './render-map.mjs';

// Explicitly excludes WordPress posts and long-form article pages. Never downloads post bodies.
const origin = 'https://abundantearthfoundation.org';
const reviewed = new Date().toISOString().slice(0, 10);
const projectSlugs = {
  'ecoversities': ['Ecoversities', 'Latin America', [], 'Youth & learning'],
  'ancientcacao': ['Ancient Cacao · Friends of Montegrande', 'Jaén, Peru', ['Peru'], 'Culture & community'],
  'clean-energy-with-comics': ['Powering Clean Cooking with Comics', 'Haiti & Africa', ['Haiti'], 'Community resilience'],
  'osa': ['ReGenerOsa Collective', 'Osa Peninsula, Costa Rica', ['Costa Rica'], 'Oceans & ecosystems'],
  'rooted-connections': ['Rooted Connections', 'East Africa', [], 'Culture & community'],
  'the-love-letters-project': ['The Love Letters Project', 'California & international', ['United States'], 'Culture & community'],
  'sunrise-studios-collective': ['SunRise Studios Collective', 'Kenya, Guatemala & Brazil', ['Kenya', 'Guatemala', 'Brazil'], 'Culture & community'],
  'mothers-of-the-amazon': ['Mothers of the Amazon', 'Brazilian Amazon', ['Brazil'], 'Culture & community'],
  'tiny-gardens': ['Tiny Gardens', 'Canada & international', ['Canada'], 'Food & forests'],
  'deeper-roots': ['Deeper Roots', 'East Africa & international', ['Kenya'], 'Food & forests'],
  'donate-to-the-reap-center': ['REAP Climate Center', 'Alameda, California', ['United States'], 'Youth & learning'],
  'donate-to-seaworthycollective': ['Seaworthy Collective', 'Miami, Florida', ['United States'], 'Oceans & ecosystems'],
};
const projectCanonical = { ancientcacao: 'ancient-cacao', osa: 'regenerosa-collective', 'the-love-letters-project': 'love-letters', 'donate-to-the-reap-center': 'reap-climate-center', 'donate-to-seaworthycollective': 'seaworthy-collective', 'clean-energy-with-comics': 'clean-cooking-with-comics' };
const pageRoutes = {
  podcasts: '/resources/podcasts/', videos: '/resources/videos/', architectsofthefuture: '/resources/architects-of-the-future/',
  'the-response-podcast': '/resources/the-response/', 'ipc-video': '/resources/seeds-of-change/',
  'fall-2019-newsletter': '/resources/newsletters/fall-2019/', 'first-newsletter-november-2018': '/resources/newsletters/november-2018/',
  intern: '/internships/', 'project-administration-internship': '/internships/project-administration/', 'build-your-own-internship': '/internships/build-your-own/',
  'permaculture-movement-fundraiser': '/campaigns/permaculture-movement/', 'together-we-can-campaign': '/campaigns/together-we-can/',
  yipp: '/youth/', 'how-to-contribute': '/how-we-help/', 'terms-of-service': '/terms/',
};
const excludedPages = new Set(['articles', 'bee-the-change', 'biomimicry', 'resilience', 'larrykorn']);
const aliases = {
  'donate-copy': '/donate/', 'maptest': '/history/#map', 'love-letters': '/projects/love-letters/',
  'hookele-industries-a-free-market-solution-to-overfishing': '/projects/',
  'individual-impact-report': '/report-impact/',
  'donor-dashboard': '/donor-support/', 'donor-dashboard-2': '/donor-support/', 'donor-dashboard-3': '/donor-support/',
  'recurring-donations': '/donor-support/#recurring', 'recurring-donations-2': '/donor-support/#recurring',
  'donation-history': '/donor-support/#receipts', 'donation-failed': '/donor-support/#payment-status',
  'donation-success-page': '/donor-support/#payment-status', clients: '/donor-support/', blog: '/stories/',
  'donate-to-refarmers': '/donate/?project=refarmers', 'donate-to-regenerative-holistic-resource-center': '/donate/?project=regenerative-holistic-resource-center',
  'donate-to-tiny-gardens': '/donate/?project=tiny-gardens',
};
const basePages = new Set(['join-the-permaculture-movement-copy', 'about-us', 'our-team', 'financials', 'contact', 'volunteer', 'how-to-apply-for-funding', 'abundant-earth-foundation-newsletter-signup', 'donate', 'bod', 'tge', 'agroforestry-regeneration-communities', 'projects-we-support', 'aef-privacy-policy']);
const manifest = { reviewed, source: origin, excludedBlogUrls: [], pages: [], campaigns: [], media: [], failures: [] };
async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(60000) }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r; }
    catch (e) { if (attempt === 2) throw e; await new Promise(r => setTimeout(r, 800)); }
  }
}
const pages = await (await get(`${origin}/wp-json/wp/v2/pages?per_page=100`)).json();
const donationRecords = await (await get(`${origin}/wp-json/wp/v2/give_forms?per_page=100&_fields=slug,title,link`)).json();
const postResponse = await get(`${origin}/wp-json/wp/v2/posts?per_page=100&_fields=id,link,slug`);
const posts = await postResponse.json();
if (Number(postResponse.headers.get('x-wp-total')) !== posts.length) throw new Error('Post inventory pagination changed; review exclusions.');
manifest.excludedBlogUrls = posts.map(p => p.link);
const home = await (await get(origin + '/')).text();
const $home = load(home);
const redirects = JSON.parse(await readFile('src/data/redirects.json', 'utf8'));
for (const page of pages) {
  const path = new URL(page.link).pathname;
  const canonical = projectSlugs[page.slug] ? `/projects/${projectCanonical[page.slug] || page.slug}/` : pageRoutes[page.slug] || aliases[page.slug];
  if (canonical && canonical !== path) redirects[path] = canonical;
}
redirects['/podcasts/'] = '/resources/podcasts/';
redirects['/yipp/'] = '/youth/';
const cleanText = html => load(html).text().replace(/\s+/g, ' ').trim();
const slugify = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const imageJobs = new Map();
function imageURL(url) {
  try {
    const parsed = new URL(url, origin);
    if (parsed.hostname !== 'abundantearthfoundation.org' || !parsed.pathname.startsWith('/wp-content/uploads/')) return '';
    const local = `/images/legacy/${createHash('sha256').update(parsed.href).digest('hex').slice(0, 16)}.webp`;
    imageJobs.set(parsed.href, local);
    return local;
  } catch { return ''; }
}
function clean(html, title) {
  const $ = load(html, null, false);
  // GiveWP wraps meaningful project descriptions in form-related containers too.
  $('.give-form-content-wrap').each((_, el) => {
    const content = $(el).removeAttr('id').removeAttr('class');
    const wrapper = content.closest('.give-form-wrap, form, [id^="give-form-"]');
    if (wrapper.length) wrapper.before(content.detach());
  });
  $('[data-settings]').each((_, el) => {
    try {
      const settings = JSON.parse($(el).attr('data-settings'));
      const url = settings.youtube_url || settings.vimeo_url || settings.dailymotion_url;
      if (url && /^https:\/\//.test(url)) $(el).append($('<p>').append($('<a>').attr('href', url).text('Watch the video on its original platform')));
    } catch { /* Non-video widgets do not need an embed replacement. */ }
  });
  // Preserve externally hosted media as accessible links, without autoplay/tracker embeds.
  $('iframe').each((_, el) => {
    const src = $(el).attr('src');
    if (src && /^https:\/\//.test(src)) $(el).replaceWith($('<p>').append($('<a>').attr('href', src).text($(el).attr('title') || 'Open the original media or form')));
    else $(el).remove();
  });
  $('script,style,form,input,button,select,textarea,label,noscript,svg,.give-donor-wall,.give-donor-wall-container,.give-donation-form-inner,.give-form-wrap,[id^="give-form-"],.give-donation-summary-section').remove();
  $('h1').each((_, e) => $(e).replaceWith($('<h2>').text($(e).text())));
  $('img').each((_, el) => {
    const image = $(el);
    if (/E-Inverted-Icons/.test(image.attr('src') || '')) { image.remove(); return; }
    const src = imageURL(image.attr('src'));
    if (!src) { image.remove(); return; }
    image.attr('src', src).attr('alt', image.attr('alt')?.trim() || `${title} — image from the original project page`).attr('loading', 'lazy');
    image.removeAttr('srcset').removeAttr('sizes').removeAttr('style').removeAttr('width').removeAttr('height');
  });
  $('a').each((_, el) => {
    const a = $(el); const href = a.attr('href') || '';
    try {
      const url = new URL(href, origin);
      if (url.hostname === 'abundantearthfoundation.org') {
        if (url.search) { a.replaceWith(a.contents()); return; }
        a.attr('href', redirects[url.pathname] || url.href);
      }
    } catch { a.replaceWith(a.contents()); }
  });
  const result = sanitize($.html().replace(/\[[\w/][^\]]*\]/g, ''), {
    allowedTags: ['h2', 'h3', 'h4', 'h5', 'p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'a'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'loading'], '*': [] },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: { h5: 'h3', h4: 'h3' },
    exclusiveFilter: frame => ['p', 'h2', 'h3'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length,
  });
  return result.replace(/\s+/g, ' ').trim();
}
const importedProjects = [], importedPages = [], sourcePages = [];
for (const page of pages) {
  const sourcePath = new URL(page.link).pathname;
  const title = cleanText(page.title.rendered);
  if (excludedPages.has(page.slug)) {
    manifest.pages.push({ source: sourcePath, decision: 'excluded-editorial-content', target: null }); continue;
  }
  if (pageRoutes[page.slug] || projectSlugs[page.slug]) {
    const body = clean(page.content.rendered, title);
    const meta = { title, bodyHtml: body, source: page.link, published: page.date.slice(0, 10), modified: page.modified.slice(0, 10), reviewed };
    if (projectSlugs[page.slug]) {
      const [name, location, countries, theme] = projectSlugs[page.slug];
      const firstImg = load(body)('img').first().attr('src') || '';
      const $body = load(body); const summary = $body('p').toArray().map(el => $body(el).text().trim()).find(t => t.length > 75 && !t.includes('Donation Amount')) || cleanText(body).replace(title, '').trim() || name;
      importedProjects.push({ ...meta, slug: projectCanonical[page.slug] || page.slug, name, shortName: name, location, countries, theme, status: `Source updated ${meta.modified}`, featured: false, image: firstImg, imageAlt: `${name} — source-page photograph`, imageCaption: `From AEF’s ${title} page, reviewed ${reviewed}.`, summary: summary.slice(0, 260), leader: 'See the source project account below', challenge: '', approach: '', support: '', outcomes: [], outcomeNote: `Source-page account, reviewed ${reviewed}. Dates, campaign targets, and stated plans retain their original context.`, externalUrl: '' });
    } else {
      importedPages.push({ ...meta, path: pageRoutes[page.slug], category: pageRoutes[page.slug].startsWith('/internships') ? 'Internships' : pageRoutes[page.slug].startsWith('/campaigns') ? 'Campaign archive' : 'Learning & community', summary: cleanText(body).slice(0, 220) });
    }
    manifest.pages.push({ source: sourcePath, decision: 'migrated', target: projectSlugs[page.slug] ? `/projects/${projectCanonical[page.slug] || page.slug}/` : pageRoutes[page.slug] });
  } else if (aliases[page.slug]) {
    manifest.pages.push({ source: sourcePath, decision: 'consolidated', target: aliases[page.slug] });
  } else if (basePages.has(page.slug)) {
    sourcePages.push({ slug: page.slug, title, bodyHtml: clean(page.content.rendered, title), source: page.link, modified: page.modified.slice(0, 10), reviewed });
    manifest.pages.push({ source: sourcePath, decision: 'existing-page-updated-or-retained', target: redirects[sourcePath] || sourcePath });
  } else { throw new Error(`Unclassified original page: ${page.slug}`); }
}

// Map content is project/grant history, not WordPress blog content.
const mapScript = $home('#interactive-geo-maps_map_service-js-extra').text();
const start = mapScript.indexOf('var iMapsData = ') + 'var iMapsData = '.length;
const end = mapScript.lastIndexOf('};') + 1;
const mapData = JSON.parse(mapScript.slice(start, end));
try {
  const response = await fetch(origin + '/igmap/10357-2/', { signal: AbortSignal.timeout(20000) });
  const extra = load(await response.text())('#interactive-geo-maps_map_service-js-extra').text();
  if (extra.includes('var iMapsData = ')) {
    const data = JSON.parse(extra.slice(extra.indexOf('var iMapsData = ') + 16, extra.lastIndexOf('};') + 1));
    mapData.data.push(...data.data);
  }
} catch (error) { manifest.failures.push({ source: origin + '/igmap/10357-2/', kind: 'map-data', reason: error.message }); }
const coords = new Map();
for (const map of mapData.data) for (const marker of map.roundMarkers || []) {
  const latitude = Number(marker.coordinates?.latitude), longitude = Number(marker.coordinates?.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && marker.coordinates?.latitude !== '') coords.set(marker.id, { latitude, longitude });
}
const history = [], historySeen = new Set();
$home('.igm-map-content').each((_, el) => {
  const container = $home(el); const identity = container.attr('data-original-id') || '';
  if (!identity || historySeen.has(identity)) return;
  historySeen.add(identity);
  const heading = container.find('h5').first();
  const headingHtml = heading.html() || identity;
  const title = cleanText(headingHtml.split(/<br\s*\/?\s*>|\n/)[0]) || identity;
  const youth = /Youth.*Permaculture.*Prize/i.test(heading.text());
  const copy = load(container.html(), null, false); copy('h5').first().remove();
  const bodyHtml = clean(copy.html(), title);
  history.push({ slug: slugify(identity), title, location: identity, youth, year: identity.match(/\b(20\d\d)\b/)?.[1] || '', bodyHtml, summary: cleanText(bodyHtml).slice(0, 200), source: origin + '/', reviewed, coordinates: coords.get(identity) || null });
});

const siteMap = load(await (await get(origin + '/wp-sitemap-posts-give_forms-1.xml')).text(), { xmlMode: true });
const donationURLs = siteMap('loc').toArray().map(el => siteMap(el).text());
const campaigns = [];
const donationMap = {
  'nonprofit': '', 'givewp-donation-form': '', 'donate-to-agroforestry-regeneration-communities': 'agroforestry-regeneration-communities',
  'tge': 'towards-green-environment', 'support-climate-education': 'beyond-organic-design', 'loveletters': 'love-letters', 'osa': 'regenerosa-collective',
  'ancientcacao': 'ancient-cacao', 'rootedconnections': 'rooted-connections', 'donate-to-refarmers': 'refarmers',
  'donate-to-deeper-roots': 'deeper-roots', 'donate-to-tiny-gardens': 'tiny-gardens', 'donate-to-youth-in-permaculture-prize': 'youth-in-permaculture',
  'donate-to-mothers-of-the-amazon': 'mothers-of-the-amazon', 'donate-to-sunrise-studio-collective': 'sunrise-studios-collective',
  'donate-to-regenerative-holistic-resource-center': 'regenerative-holistic-resource-center',
  'powering-clean-energy-with-comics-a-biogas-education-pilot': 'clean-cooking-with-comics',
};
for (const url of donationURLs) {
  const path = new URL(url).pathname; const slug = path.split('/').filter(Boolean).at(-1);
  if (Object.hasOwn(donationMap, slug)) {
    const target = donationMap[slug] ? `/donate/?project=${donationMap[slug]}` : '/donate/';
    redirects[path] = target; manifest.campaigns.push({ source: path, decision: 'consolidated', target });
  } else {
    let html = '';
    try { const r = await fetch(url, { signal: AbortSignal.timeout(8000) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); html = await r.text(); } catch (error) { manifest.failures.push({ source: url, kind: 'campaign-body', reason: error.message }); }
    const $ = load(html);
    const title = cleanText(donationRecords.find(d => d.slug === slug)?.title.rendered || '') || $('h1').first().text().trim() || slug.replaceAll('-', ' ');
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const target = `/campaigns/legacy-${slug}/`;
    campaigns.push({ path: target, title, category: 'Campaign archive', summary: description, bodyHtml: `<p>${sanitize(description, { allowedTags: [] }) || 'This campaign was listed in the original foundation’s donation directory.'}</p><p>This is a historical campaign entry. Ask the foundation about current availability, beneficiaries, and the appropriate giving route.</p>`, source: url, reviewed, modified: '', published: '' });
    redirects[path] = target; manifest.campaigns.push({ source: path, decision: 'archived-campaign', target });
  }
}

const providerLinks = [];
for (const page of pages) {
  const urls = [...page.content.rendered.matchAll(/https:\/\/secure\.givelively\.org\/donate\/[^\s"'<>]+/g)].map(m => m[0].replace(/\?.*/, ''));
  for (const url of new Set(urls)) providerLinks.push({ page: page.slug, url, source: page.link });
}
const formSource = pages.find(p => p.slug === 'abundant-earth-foundation-newsletter-signup');
const $form = load(formSource.content.rendered);
const newsletterAction = $form('form').attr('action');
const partners = [];
$home('.elementor-image-carousel .swiper-slide-image').each((_, el) => {
  const src = $home(el).attr('src'); if (src?.includes('/elementor/thumbs/')) partners.push({ image: imageURL(src), alt: `Partner mark ${partners.length + 1} from the original foundation website`, source: origin + '/' });
});
imageURL(origin + '/wp-content/uploads/2021/07/cropped-AEF_WEB_LOGO.png');
// Download only images referenced by imported content; retain source/failure information.
await mkdir('public/images/legacy', { recursive: true });
const failures = new Set();
const jobs = [...imageJobs];
console.log(`Preparing ${jobs.length} source images; existing local copies are reused.`);
for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(async ([url, local]) => {
  try {
    try { await access('public' + local); } catch {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      await sharp(buffer).rotate().resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 76 }).toFile('public' + local);
    }
    manifest.media.push({ source: url, local });
  } catch (error) { failures.add(local); manifest.failures.push({ source: url, reason: error.message }); }
}));
for (const record of [...importedProjects, ...importedPages, ...history, ...sourcePages]) {
  const $ = load(record.bodyHtml, null, false);
  $('img').each((_, el) => { if (failures.has($(el).attr('src'))) $(el).remove(); });
  record.bodyHtml = $.html();
  if (failures.has(record.image)) record.image = '';
}
await writeFile('public/images/world-land.svg', worldSvg());
const write = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n');
await write('src/data/legacy-projects.json', importedProjects);
await write('src/data/legacy-pages.json', [...importedPages, ...campaigns]);
await write('src/data/legacy-history.json', history);
await write('src/data/source-pages.json', sourcePages);
await write('src/data/legacy-providers.json', { reviewed, links: providerLinks, newsletterAction, newsletterSource: formSource.link });
await write('src/data/legacy-partners.json', partners.filter(p => !failures.has(p.image)));
await write('src/data/redirects.json', redirects);
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
vercel.redirects = Object.entries(redirects).map(([source, destination]) => ({ source, destination, statusCode: 301 }));
await write('vercel.json', vercel);
await write('docs/migration-manifest.json', manifest);
console.log(JSON.stringify({ projects: importedProjects.length, pages: importedPages.length, campaignRecords: campaigns.length, historyRecords: history.length, mappedCoordinates: history.filter(h => h.coordinates).length, excludedBlogPosts: posts.length, media: manifest.media.length, mediaFailures: manifest.failures.length, providers: providerLinks.length }, null, 2));
