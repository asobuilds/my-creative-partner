import 'dotenv/config';
import { generateAgnesVideo, agnesReady } from '../adapters/agnes.js';
import { pollinationsVideo } from '../adapters/pollinations.js';

export default function mountAnimate(app) {
  app.get('/api/animate/status', (_req, res) => {
    res.json({ agnes: agnesReady, pollinations: true });
  });

  app.post('/api/animate', async (req, res) => {
    const { prompt, imageUrl, durationSec = 5 } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    // Path A: Agnes AI (real animated video with motion)
    if (agnesReady) {
      try {
        const result = await generateAgnesVideo(prompt, {
          imageUrl,
          numFrames: Math.min(121, Math.max(81, durationSec * 24)),
          frameRate: 24,
        });
        return res.json({ ok: true, videoUrl: result.videoUrl, source: 'agnes' });
      } catch (e) {
        console.warn('[animate] agnes failed:', e.message);
      }
    }

    // Path B: Pollinations video (free, keyless, instant URL)
    try {
      const url = pollinationsVideo(prompt, { duration: durationSec });
      return res.json({ ok: true, videoUrl: url, source: 'pollinations', note: 'Streaming MP4 URL — may take 20-60s to load in browser' });
    } catch (e) {
      return res.status(500).json({ error: 'All animation providers failed: ' + e.message });
    }
  });
}
