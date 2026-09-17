import projectData from '../data/projects.json';
import storyData from '../data/stories.json';
export { default as site } from '../data/site.json';
export const projects = projectData;
export const stories = storyData;
export type Project = (typeof projects)[number];
export type Story = (typeof stories)[number];
export const projectPath = (slug: string) => `/projects/${slug}/`;
export const storyPath = (slug: string) => `/stories/${slug}/`;
