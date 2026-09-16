import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { NodePipelineRouter } from './router/NodePipelineRouter.js';
import { llmReady, providerStatus } from './adapters/llm.js';
import { meshReady } from './adapters/mesh.js';
import { ttsReady } from './adapters/tts.js';
import { mediaReady } from './adapters/media.js';
import { videoReady } from './adapters/video.js';
import { blenderReady } from './adapters/blender.js';
import { higgsfieldReady } from './adapters/higgsfield.js';
import mountTts from './routes/tts.js';
import mountImage from './routes/image.js';

const PORT = Number(process.env.PORT) || 5000;
const ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/renders', express.static(process.env.BLENDER_OUTPUT_PATH || '/tmp/synthetix-renders'));

app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    llm: llmReady,
    providers: providerStatus,
    mesh: meshReady,
    tts: ttsReady,
    media: mediaReady,
    video: videoReady,
    blender: blenderReady,
    higgsfield: higgsfieldReady,
    uptime: process.uptime(),
  })
);

const routers = new Map();

app.post('/api/command', (req, res) => {
  const body = req.body || {};
  const connId = body.connId;
  let r = connId ? routers.get(connId) : null;
  if (!r) r = routers.values().next().value;
  if (!r) return res.status(400).json({ error: 'No active connection' });
  if (body.type === 'graph:run') r.handleRun(body);
  if (body.type === 'graph:cancel') r.cancel();
  res.json({ ok: true });
});

mountTts(app);
mountImage(app);
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/stream' });

wss.on('connection', (ws) => {
  const connId = 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const router = new NodePipelineRouter((frame) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(frame));
  });
  routers.set(connId, router);

  ws.send(JSON.stringify({ type: 'hello', connId }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (e) { return; }
    if (msg.type === 'ping') return ws.send(JSON.stringify({ type: 'pong' }));
    if (msg.type === 'graph:run') return router.handleRun(msg);
    if (msg.type === 'graph:cancel') return router.cancel();
  });

  ws.on('close', () => { router.cancel(); routers.delete(connId); });
  ws.on('error', () => { router.cancel(); routers.delete(connId); });
});

app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  if (res.flushHeaders) res.flushHeaders();
  const router = new NodePipelineRouter((f) => res.write('data: ' + JSON.stringify(f) + '\n\n'));
  const connId = 'sse-' + Date.now();
  routers.set(connId, router);
  const ka = setInterval(() => res.write(': ping\n\n'), 20000);
  req.on('close', () => { clearInterval(ka); router.cancel(); routers.delete(connId); });
});

server.listen(PORT, () => {
  console.log('Synthetix orchestrator on :' + PORT
    + '  [llm=' + llmReady
    + ' providers=' + JSON.stringify(providerStatus)
    + ' tts=' + ttsReady
    + ' video=' + videoReady + ' blender=' + blenderReady + ' hf=' + higgsfieldReady + ']');
});
