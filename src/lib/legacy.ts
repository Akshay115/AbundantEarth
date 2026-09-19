import { load } from 'cheerio';
import sanitize from 'sanitize-html';
import redirects from '../data/redirects.json' with { type: 'json' };

// Sanitize again at build time: the Git content editor must not become a script injection path.
export function renderLegacyHtml(html: string) {
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
  return sanitize($.html(), {
    allowedTags: ['h2', 'h3', 'p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'a'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'loading'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: { h1: 'h2', h4: 'h3', h5: 'h3' },
  });
}
