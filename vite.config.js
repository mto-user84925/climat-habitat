import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

let inseeCache = null;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'climat-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/climat')) {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const insee = parsedUrl.searchParams.get('insee');
            if (!insee) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Code INSEE requis' }));
              return;
            }

            try {
              if (!inseeCache) {
                const idxPath = path.resolve(__dirname, 'public/data/insee_index.json');
                inseeCache = JSON.parse(fs.readFileSync(idxPath, 'utf-8'));
              }

              const entry = inseeCache[insee];
              if (!entry) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Commune ${insee} non trouvée` }));
                return;
              }

              const [offset, length] = entry;
              const upstream = 'https://climadiag-commune.meteofrance.com/entities.jsonl';
              const r = await fetch(upstream, {
                headers: {
                  'Range': `bytes=${offset}-${offset + length - 1}`
                }
              });

              const text = await r.text();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(text);
              return;
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
