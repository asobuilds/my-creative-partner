import 'dotenv/config';
import { searchAll, mediaReady } from '../adapters/media.js';
import { higgsfieldReady, generateImage } from '../adapters/higgsfield.js';
import { aiImageUrl } from '../adapters/freeImage.js';
import { enrichQuery } from '../adapters/africanEnhancer.js';

const STOP = new Set(['a','an','the','of','with','and','in','on','at','to','for','by','from','that','this','my','your','our','their','is','are','was','were','there']);

function cleanQuery(prompt) {
  const words = String(prompt || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
  return words.slice(0, 4).join(' ');
}

export default function mountReference(app) {
  app.get('/api/reference/status', (_req, res) => {
    res.json({
      pexels: mediaReady.pexels,
      pixabay: mediaReady.pixabay,
      higgsfield: higgsfieldReady,
      pollinations: true,
    });
  });

  app.get('/api/reference', async (req, res) => {
    const raw = String(req.query.q || '').trim();
    if (!raw) return res.status(400).json({ error: 'q required' });
    const query = cleanQuery(raw) || raw;
    const enriched = enrichQuery(raw);
    const mode = String(req.query.mode || 'auto');

    const result = { query, prompt: raw, source: null, url: null, thumb: null, credit: null, ai: false };

    // 1. Higgsfield (best, needs credits)
    if ((mode === 'ai' || mode === 'auto') && higgsfieldReady) {
      try {
        const url = await generateImage(
          'a realistic photograph of a ' + enriched + ', natural lighting, high detail, single subject, no text',
          { timeoutMs: 45000, aspectRatio: '1:1' }
        );
        if (url) {
          result.url = url; result.thumb = url; result.source = 'higgsfield'; result.ai = true;
          return res.json(result);
        }
      } catch (e) {
        console.warn('[reference] higgsfield failed:', e.message);
      }
    }

    // 2. Pollinations free AI
    try {
      const url = aiImageUrl(enriched + ', realistic photograph, natural lighting, high detail, no text', { width: 768, height: 768 });
      result.url = url; result.thumb = url; result.source = 'pollinations'; result.ai = true;
      return res.json(result);
    } catch (e) {
      console.warn('[reference] pollinations failed:', e.message);
    }

    // 3. Stock photos
    try {
      const photos = await searchAll(enriched, { perPage: 4 });
      if (photos && photos.length) {
        const p = photos[0];
        result.url = p.url; result.thumb = p.thumb; result.source = p.source; result.credit = p.credit;
        return res.json(result);
      }
    } catch (e) {
      console.warn('[reference] stock failed:', e.message);
    }

    res.json(result);
  });
}
