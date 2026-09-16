import 'dotenv/config';

const {
  HF_API_KEY_ID,
  HF_API_KEY_SECRET,
  HF_BASE_URL = 'https://api.higgsfield.ai',
  HF_MODEL = 'higgsfield-ai/soul/v2/standard',
} = process.env;

const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');
export const higgsfieldReady = isReal(HF_API_KEY_ID) && isReal(HF_API_KEY_SECRET);
let _hfCredits = 'unknown'; // unknown | ok | empty
export function getHfStatus() { return { ready: higgsfieldReady, credits: _hfCredits }; }

const auth = () => 'Key ' + HF_API_KEY_ID + ':' + HF_API_KEY_SECRET;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function submit(prompt) {
  const res = await fetch(HF_BASE_URL + '/' + HF_MODEL, {
    method: 'POST',
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (res.status === 403) { _hfCredits = 'empty'; throw new Error('HF no credits'); }
  if (!res.ok) throw new Error('HF submit ' + res.status + ': ' + (await res.text()).slice(0, 200));
  _hfCredits = 'ok';
  const j = await res.json();
  return j.request_id;
}

async function poll(id, { tries = 40, ms = 2500 } = {}) {
  for (let i = 0; i < tries; i++) {
    await sleep(ms);
    const res = await fetch(HF_BASE_URL + '/requests/' + id + '/status', {
      headers: { Authorization: auth() },
    });
    const j = await res.json();
    if (j.status === 'completed') return (j.images && j.images[0] && j.images[0].url) || null;
    if (j.status === 'failed' || j.status === 'nsfw') throw new Error('HF ' + j.status);
  }
  throw new Error('HF timeout');
}

export default function mountImage(app) {
  app.post('/api/image', async (req, res) => {
    if (!higgsfieldReady) return res.status(503).json({ error: 'Higgsfield not configured' });
    const { prompt } = req.body || {};
    if (!prompt || prompt.trim().length < 3) return res.status(400).json({ error: 'prompt required' });
    try {
      const id = await submit(prompt.slice(0, 500));
      const url = await poll(id);
      res.json({ ok: true, url });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.get('/api/image/status', (_req, res) => {
    res.json({ ready: higgsfieldReady, credits: _hfCredits });
  });
}
