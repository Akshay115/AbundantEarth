import { load } from 'cheerio';
import sanitize from 'sanitize-html';
import redirects from '../data/redirects.json' with { type: 'json' };

// Sanitize again at build time: the Git content editor must not become a script injection path.
export function renderLegacyHtml(html: string, variant: 'default' | 'team' = 'default') {
  const $ = load(html, null, false);
  const goals = ['No poverty', 'Zero hunger', 'Good health and well-being', 'Quality education', 'Gender equality', 'Clean water and sanitation', 'Affordable and clean energy', 'Decent work and economic growth', 'Industry, innovation and infrastructure', 'Reduced inequalities', 'Sustainable cities and communities', 'Responsible consumption and production', 'Climate action', 'Life below water', 'Life on land', 'Peace, justice and strong institutions', 'Partnerships for the goals'];
  $('a').each((_, el) => {
    const a = $(el);
    const goal = a.attr('href')?.match(/E-Inverted-Icons_WEB-(\d+)/)?.[1];
    if (goal && goals[Number(goal) - 1]) {
      a.attr('href', `https://sdgs.un.org/goals/goal${Number(goal)}`).text(`SDG ${Number(goal)}: ${goals[Number(goal) - 1]}`);
    } else if (!a.text().trim() && !a.find('img[alt]').length) {
      a.remove(); return;
    }
    try {
      const url = new URL(a.attr('href') || '', 'https://abundantearthfoundation.org');
      const target = (redirects as Record<string, string>)[url.pathname];
      if (url.hostname === 'abundantearthfoundation.org' && target && !url.search) a.attr('href', target);
      if (url.hostname === 'podcasts.google.com') a.replaceWith($('<span>').text('Google Podcasts link (retired service)'));
    } catch { a.replaceWith(a.contents()); }
  });
  const safe = sanitize($.html(), {
    allowedTags: ['h2', 'h3', 'p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'a'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'loading'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: { h1: 'h2', h4: 'h3', h5: 'h3' },
  });
  return arrangeContent(safe, variant);
}

// Presentation-only normalization after sanitization. The imported source datasets stay intact.
function arrangeContent(html: string, variant: 'default' | 'team') {
  const $ = load(html, null, false);
  $('figure').filter((_, el) => !$(el).text().trim() && !$(el).find('img').length).remove();

  // Page builders sometimes leave a lead sentence and the entire body as bare inline nodes.
  $.root().children('i, em').each((_, el) => {
    const next = el.nextSibling;
    if (next?.type === 'text' && next.data.trim().length > 600) $(el).wrap('<p class="source-lead"></p>');
  });
  const nodes = $.root().contents().toArray();
  let inline: typeof nodes = [];
  const flushInline = () => {
    if (inline.length) { $(inline).wrapAll('<p></p>'); inline = []; }
  };
  $.root().contents().each((_, node) => {
    if (node.type === 'text' && !node.data.trim()) return;
    if (node.type === 'text' || (node.type === 'tag' && ['a', 'strong', 'em', 'b', 'i', 'br'].includes(node.tagName) && !$(node).find('img').length)) inline.push(node);
    else flushInline();
  });
  flushInline();

  // Split very long, unformatted paragraphs only at sentence boundaries, preserving the text.
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  $.root().children('p').each((_, el) => {
    const paragraph = $(el);
    if (paragraph.children().length || paragraph.text().length < 800) return;
    const chunks: string[] = [];
    let chunk = '';
    for (const { segment } of segmenter.segment(paragraph.text())) {
      if (chunk.length >= 360) { chunks.push(chunk); chunk = ''; }
      chunk += segment;
    }
    if (chunk) chunks.push(chunk);
    if (chunks.length > 1) paragraph.replaceWith(chunks.map(text => $('<p>').text(text).toString()).join('\n'));
  });

  if (variant === 'team') {
    const headings = $.root().children('h3').toArray();
    const cards = $('<div class="team-profiles"></div>');
    let inserted = false;
    for (const heading of headings) {
      const name = $(heading);
      const portrait = name.prev('figure');
      const first = portrait.length ? portrait : name;
      if (!inserted) { first.before(cards); inserted = true; }
      const section = $('<article class="team-profile"></article>');
      const nodes = first.nextUntil('figure, h3').addBack().toArray();
      for (const node of nodes) {
        if ($(node).is('p') && /^By joining together/.test($(node).text().trim())) break;
        section.append($(node));
      }
      // The name follows the portrait, so include it and its biography explicitly.
      if (portrait.length && !section.find('h3').length) {
        const biography = name.nextUntil('figure, h3').addBack().toArray();
        for (const node of biography) {
          if ($(node).is('p') && /^By joining together/.test($(node).text().trim())) break;
          section.append($(node));
        }
      }
      section.find('h3').first().next('p').addClass('team-role');
      cards.append(section);
    }
  }

  function groupSiblings(selector: string, className: string) {
    let group: typeof nodes = [];
    const flush = () => { if (group.length > 1) $(group).wrapAll(`<div class="${className}"></div>`); group = []; };
    $.root().children().each((_, el) => {
      if ($(el).is(selector)) group.push(el);
      else flush();
    });
    flush();
  }
  if (variant !== 'team') groupSiblings('figure:has(img), p:has(img):not(:has(strong, em)), img', 'source-gallery');
  groupSiblings('figure:has(a[href^="https://sdgs.un.org/"])', 'source-goals');

  // Old donor widgets can dominate a project narrative; retain them as a compact source appendix.
  $.root().children('h2').filter((_, el) => /current donors/i.test($(el).text())).each((_, el) => {
    const heading = $(el);
    const content = heading.nextUntil('h2');
    const details = $('<details class="source-acknowledgments"></details>');
    details.append($('<summary>').text('Donor acknowledgments from the source page'));
    details.append($('<div class="source-acknowledgments-body"></div>').append($('<p>').text(heading.text()), content));
    heading.replaceWith(details);
  });
  return $.html();
}
