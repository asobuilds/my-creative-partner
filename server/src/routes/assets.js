import { searchAssets, assetSources } from '../adapters/assetSearch.js';
import { downloadPolyHavenModel } from '../adapters/download3d.js';

export default function mountAssets(app) {
  app.get('/api/assets/status', (_req, res) => {
    res.json(assetSources);
  });

  app.post('/api/assets/fetch', async (req, res) => {
    const { id, source } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    try {
      if (source === 'polyhaven') {
        const url = await downloadPolyHavenModel(id);
        return res.json({ ok: true, modelUrl: url });
      }
      return res.status(400).json({ error: 'Unsupported source: ' + source });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
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
