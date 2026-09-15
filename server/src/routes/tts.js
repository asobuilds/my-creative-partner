import { synthesize, ttsReady } from '../adapters/tts.js';

export default function mountTts(app) {
  app.post('/api/tts', async (req, res) => {
    if (!ttsReady) return res.status(503).json({ error: 'TTS not configured' });
    const { text, voiceId } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text required' });
    }
    try {
      const buf = await synthesize(text.slice(0, 500), { voiceId });
      res.set('Content-Type', 'audio/mpeg');
      res.set('Cache-Control', 'no-store');
      res.end(buf);
    } catch (e) {
      res.status(500).json({ error: String((e && e.message) || e) });
    }
  });
}
