import { readFile } from 'node:fs/promises';
import { speak } from '../adapters/readAloud.js';

export default function mountSpeak(app) {
  app.post('/api/speak', async (req, res) => {
    const { text, voice } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text required' });
    try {
      const filePath = await speak(text, voice ? { voice } : {});
      const buf = await readFile(filePath);
      res.set('Content-Type', 'audio/mpeg');
      res.set('Cache-Control', 'public, max-age=3600');
      res.end(buf);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });
}
