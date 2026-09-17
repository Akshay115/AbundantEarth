import { defineConfig } from 'astro/config';
import { loadEnvFile } from 'node:process';
import redirects from './src/data/redirects.json' with { type: 'json' };

// Astro config runs before Vite loads .env. Native loading keeps shell values authoritative.
try { loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }

export default defineConfig({
  site: process.env.SITE_URL || 'https://abundantearthfoundation.org',
  output: 'static',
  trailingSlash: 'always',
  redirects,
  devToolbar: { enabled: false },
});
