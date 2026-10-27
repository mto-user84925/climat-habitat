import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

let inseeCache = null;

function normalizeInsee(code) {
  if (!code) return code;
  if (/^132(0[1-9]|1[0-6])$/.test(code)) return '13055';
  if (/^751(0[1-9]|1[0-9]|20)$/.test(code)) return '75056';
  if (/^6938[1-9]$/.test(code)) return '69123';
  return code;
}

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

              const safeInsee = normalizeInsee(insee);
              const entry = inseeCache[safeInsee];
              if (!entry) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Commune ${safeInsee} (recherche: ${insee}) non trouvée` }));
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
