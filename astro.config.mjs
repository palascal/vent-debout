// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://vent-debout.vercel.app',
  trailingSlash: 'always',
  output: 'server',
  adapter: vercel(),
  server: { port: 4322 },
});
