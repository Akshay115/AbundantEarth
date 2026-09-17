import type { APIRoute } from 'astro';
import { projects, stories } from '../lib/content';
import participation from '../data/participation.json';
const paths = ['/', '/about/', '/projects/', '/impact/', '/stories/', '/get-involved/', '/get-support/', '/donate/', '/newsletter/', '/contact/', '/financials/', '/resources/', '/privacy/', '/accessibility/', '/sources/', ...participation.map(p => `/${p.slug}/`), ...projects.map(p => `/projects/${p.slug}/`), ...stories.map(s => `/stories/${s.slug}/`)];
export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${new URL(path, site).href}</loc></url>`).join('')}</urlset>`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
