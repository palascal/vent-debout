// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

const pages = process.env.DEPLOY === 'pages';

/** Éditeur local : enregistre data/site.json. Absent du site statique publié. */
function cmsDevApi() {
  return {
    name: 'vent-debout-cms',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0];
        if (path !== '/api/content' && path !== '/api/content/') return next();
        try {
          const { readSite, writeSite } = await server.ssrLoadModule('/src/lib/store.ts');
          if (req.method === 'GET') {
            const site = await readSite();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(site));
            return;
          }
          if (req.method === 'PUT') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const site = await writeSite(body);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, site }));
            return;
          }
          res.statusCode = 405;
          res.end();
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur' }));
        }
      });
    },
  };
}

export default defineConfig({
  site: pages ? 'https://palascal.github.io' : 'https://ventsdebout.fr',
  base: pages ? '/vent-debout' : '/',
  trailingSlash: 'always',
  output: pages ? 'static' : 'server',
  adapter: pages ? undefined : node({ mode: 'standalone' }),
  server: { port: 4322 },
  vite: { plugins: [cmsDevApi()] },
});
