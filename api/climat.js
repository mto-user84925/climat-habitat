// Vercel Serverless Function: /api/climat?insee=XXXXX
import fs from 'fs';
import path from 'path';

let inseeIndexCache = null;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { insee } = req.query;
  if (!insee) {
    return res.status(400).json({ error: "Code INSEE requis" });
  }

  try {
    // Load index if not cached
    if (!inseeIndexCache) {
      let indexPath = path.join(process.cwd(), 'api', 'data', 'insee_index.json');
      if (!fs.existsSync(indexPath)) {
        indexPath = path.join(process.cwd(), 'public', 'data', 'insee_index.json');
      }
      const raw = fs.readFileSync(indexPath, 'utf-8');
      inseeIndexCache = JSON.parse(raw);
    }

    const entry = inseeIndexCache[insee];
    if (!entry) {
      return res.status(404).json({ error: `Commune INSEE ${insee} introuvable dans l'index` });
    }

    const [offset, length] = entry;
    const end = offset + length - 1;

    // Fetch the exact byte slice from Météo-France storage
    const upstreamUrl = 'https://climadiag-commune.meteofrance.com/entities.jsonl';
    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'ClimatHabitat/1.0 (Météo-Climat Pro)',
        'Range': `bytes=${offset}-${end}`
      }
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`Upstream returned HTTP ${response.status}`);
    }

    const text = await response.text();
    const data = JSON.parse(text.trim());

    // Cache response for 24h on Vercel Edge CDN
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching climate data:', err);
    return res.status(500).json({ error: "Erreur lors de la récupération des projections climatiques", details: err.message });
  }
}
