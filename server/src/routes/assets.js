import { searchAssets, assetSources } from '../adapters/assetSearch.js';

export default function mountAssets(app) {
  app.get('/api/assets/status', (_req, res) => {
    res.json(assetSources);
  });

  app.get('/api/assets/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q required' });
    try {
      const data = await searchAssets(q, { limit: 20 });
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });
}
