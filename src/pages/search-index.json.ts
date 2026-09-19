import type { APIRoute } from 'astro';
import { load } from 'cheerio';
import { projects, history, legacyPages, stories } from '../lib/content';
const text = (html: string) => load(html).text().replace(/\s+/g, ' ').trim();
const records = [
  ...projects.map(p => ({ title: p.name, url: `/projects/${p.slug}/`, type: 'Project', description: p.summary, text: `${p.location} ${p.countries.join(' ')} ${p.summary} ${text(p.bodyHtml || p.approach)}` })),
  ...history.map(h => ({ title: h.title, url: `/history/${h.slug}/`, type: h.youth ? 'Youth recipient' : 'Historical record', description: h.location, text: `${h.location} ${text(h.bodyHtml)}` })),
  ...legacyPages.map(p => ({ title: p.title, url: p.path, type: p.category, description: p.summary, text: text(p.bodyHtml) })),
  ...stories.map(s => ({ title: s.title, url: `/stories/${s.slug}/`, type: 'Story', description: s.summary, text: s.paragraphs.join(' ') })),
  ...[['Contact the foundation', '/contact/', 'Get in touch'], ['Funding availability', '/get-support/', 'Applications are currently closed'], ['Financial records', '/financials/', 'Form 990 nonprofit transparency'], ['Donation receipts and subscriptions', '/donor-support/', 'Payment status and recurring donations'], ['Project impact reporting', '/report-impact/', 'Share a project update'], ['Newsletter signup', '/newsletter/', 'Keep in touch']].map(([title, url, description]) => ({ title, url, description, type: 'Information', text: `${title} ${description}` })),
];
export const GET: APIRoute = () => new Response(JSON.stringify(records), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
