import 'dotenv/config';
import { completeText, llmReady } from '../adapters/llm.js';

export default function mountChat(app) {
  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' });
    }
    if (!llmReady) return res.status(503).json({ error: 'llm_unavailable' });
    try {
      const text = await completeText(messages, { maxTokens: 600, temperature: 0.85 });
      res.json({ ok: true, text: text || '(no response)' });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });
}
