import 'dotenv/config';
import { searchAll } from '../adapters/media.js';
import { aiImageUrl } from '../adapters/freeImage.js';

export default function mountImageSearch(app) {
  app.get('/api/image-search', async (req, res) => {
    const q = String(req.query.q || '').trim().slice(0, 100);
    if (!q) return res.status(400).json({ error: 'q required' });

    const results = [];

    // 1. AI images (4 variations)
    for (let i = 0; i < 4; i++) {
      const url = aiImageUrl(
        q + ', single subject, natural lighting, high detail, centered, plain background, no text',
        { width: 512, height: 512, seed: Date.now() + i * 7919 }
      );
      if (url) {
        results.push({
          id: 'ai-' + i,
          kind: 'image',
          title: 'AI · ' + q,
          thumb: url,
          src: url,
          source: 'pollinations',
          license: 'Free',
        });
      }
    }

    // 2. Real photos (Pexels + Pixabay)
    try {
      const photos = await searchAll(q, { perPage: 4 });
      for (const p of photos) {
        results.push({
          id: p.id,
          kind: 'image',
          title: q + ' · ' + (p.source || 'photo'),
          thumb: p.thumb || p.url,
          src: p.url,
          source: p.source,
          license: 'Free',
          credit: p.credit,
        });
      }
    } catch (e) {
      console.warn('[image-search] stock failed:', e.message);
    }

    res.json({ query: q, results });
  });
}
