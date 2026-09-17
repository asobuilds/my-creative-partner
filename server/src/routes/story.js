import 'dotenv/config';
import { renderStory, pollStory, videoReady } from '../adapters/video.js';

export default function mountStory(app) {
  app.get('/api/story/status', (_req, res) => {
    res.json({ ready: videoReady });
  });

  app.post('/api/story/render', async (req, res) => {
    if (!videoReady) return res.status(503).json({ error: 'Shotstack not configured' });
    const { imageUrl, title, subtitle, durationSec } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'imageUrl required' });
    }
    try {
      const renderId = await renderStory({
        imageUrl,
        title: title || 'WonderPal',
        subtitle: subtitle || '',
        durationSec: Math.max(4, Math.min(12, durationSec || 6)),
      });
      const url = await pollStory(renderId, { timeoutMs: 180000 });
      res.json({ ok: true, url, renderId });
    } catch (e) {
      res.status(500).json({ error: String((e && e.message) || e) });
    }
  });

  // Fire-and-forget kick: returns renderId immediately, client polls /status/:id
  app.post('/api/story/kick', async (req, res) => {
    if (!videoReady) return res.status(503).json({ error: 'Shotstack not configured' });
    const { imageUrl, title, subtitle, durationSec } = req.body || {};
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });
    try {
      const renderId = await renderStory({
        imageUrl,
        title: title || 'WonderPal',
        subtitle: subtitle || '',
        durationSec: Math.max(4, Math.min(12, durationSec || 6)),
      });
      res.json({ ok: true, renderId });
    } catch (e) {
      res.status(500).json({ error: String((e && e.message) || e) });
    }
  });

  app.get('/api/story/status/:id', async (req, res) => {
    if (!videoReady) return res.status(503).json({ error: 'Shotstack not configured' });
    try {
      const url = await pollStory(req.params.id, { timeoutMs: 5000, intervalMs: 500 }).catch(() => null);
      res.json({ ok: true, url, pending: !url });
    } catch (e) {
      res.json({ ok: true, url: null, pending: true });
    }
  });
}
