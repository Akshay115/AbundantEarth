import projectData from '../data/projects.json';
import storyData from '../data/stories.json';
import importedProjects from '../data/legacy-projects.json';
import sourcePages from '../data/source-pages.json';
export { default as site } from '../data/site.json';
export { default as legacyPages } from '../data/legacy-pages.json';
export { default as history } from '../data/legacy-history.json';
export { default as sourcePages } from '../data/source-pages.json';
export type Project = (typeof projectData)[number] & { bodyHtml?: string; modified?: string; reviewed?: string };
const updates: Record<string, string> = { 'agroforestry-regeneration-communities': 'agroforestry-regeneration-communities', 'towards-green-environment': 'tge', 'beyond-organic-design': 'bod' };
export const projects: Project[] = [...projectData.map(project => {
  const source = sourcePages.find(page => page.slug === updates[project.slug]);
  return source ? { ...project, bodyHtml: source.bodyHtml, source: source.source, modified: source.modified, reviewed: source.reviewed, status: `Source reviewed ${source.reviewed}`, ...(project.slug === 'beyond-organic-design' ? { name: 'Eco-Designers (formerly Beyond Organic Design)' } : {}) } : project;
}), ...importedProjects.map(project => ({ ...project, summary: project.summary.length >= 250 ? project.summary.replace(/\s+\S*$/, '') + '…' : project.summary }))];
export const stories = storyData;
export type Story = (typeof stories)[number];
export const projectPath = (slug: string) => `/projects/${slug}/`;
export const storyPath = (slug: string) => `/stories/${slug}/`;
export const imageUrl = (image: string) => image.startsWith('/') ? image : image ? `/images/${image}-1600.webp` : '/favicon.svg';
