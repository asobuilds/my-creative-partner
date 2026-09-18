import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import os from 'node:os';
import path from 'node:path';
import { llmReady, providerStatus } from './adapters/llm.js';
import mountStoryPage from './routes/storyPage.js';
import mountImageSearch from './routes/imageSearch.js';
import mountReference from './routes/reference.js';
import mountSpeak from './routes/speak.js';
import mountStory from './routes/story.js';
import mountAnimate from './routes/animate.js';

const PORT = Number(process.env.PORT) || 5000;
const ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: '4mb' }));

// Static caches
app.use('/images', express.static(path.join(os.tmpdir(), 'synthetix-images')));
app.use('/models', express.static(path.join(os.tmpdir(), 'synthetix-models')));
app.use('/renders', express.static(path.join(os.tmpdir(), 'synthetix-renders')));

app.get('/health', (_req, res) => res.json({
  ok: true,
  llm: llmReady,
  providers: providerStatus,
  uptime: process.uptime(),
}));

// Debug LLM
app.get('/api/debug/llm', async (req, res) => {
  const t0 = Date.now();
  try {
    const { streamChat } = await import('./adapters/llm.js');
    let raw = '';
    for await (const d of streamChat([{ role: 'user', content: 'Reply with exactly: {"ok":true,"msg":"hello"}' }], { maxTokens: 100, temperature: 0.3 })) {
      raw += d;
      if (raw.length > 2000) break;
    }
    res.json({ ok: true, ms: Date.now() - t0, rawLen: raw.length, rawSample: raw.slice(0, 400) });
  } catch (e) {
    res.json({ ok: false, ms: Date.now() - t0, error: String(e.message || e) });
  }
});

mountStoryPage(app);
mountImageSearch(app);
mountReference(app);
mountSpeak(app);
mountStory(app);
mountAnimate(app);

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log('9jaWonderPal on :' + PORT
    + '  [llm=' + llmReady
    + ' providers=' + JSON.stringify(providerStatus) + ']');
});
