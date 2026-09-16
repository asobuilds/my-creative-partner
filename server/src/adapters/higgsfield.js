import 'dotenv/config';

const {
  HF_API_KEY_ID,
  HF_API_KEY_SECRET,
  HF_BASE_URL = 'https://api.higgsfield.ai',
  HF_MODEL = 'higgsfield-ai/soul/v2/standard',
} = process.env;

const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');
export const higgsfieldReady = isReal(HF_API_KEY_ID) && isReal(HF_API_KEY_SECRET);

const authHeader = () => 'Key ' + HF_API_KEY_ID + ':' + HF_API_KEY_SECRET;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function higgsfieldSubmit(endpoint, payload) {
  if (!higgsfieldReady) throw new Error('Higgsfield credentials missing');
  const res = await fetch(HF_BASE_URL + '/' + endpoint, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Higgsfield ' + res.status + ': ' + text.slice(0, 240));
  }
  const json = await res.json();
  return json.request_id;
}

export async function higgsfieldPoll(requestId, { timeoutMs = 180000, intervalMs = 2500 } = {}) {
  if (!higgsfieldReady) throw new Error('Higgsfield credentials missing');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(HF_BASE_URL + '/requests/' + requestId + '/status', {
      headers: { Authorization: authHeader() },
    });
    const json = await res.json();
    if (json.status === 'completed') return json;
    if (json.status === 'failed') throw new Error('Higgsfield failed: ' + (json.error || 'unknown'));
    if (json.status === 'nsfw') throw new Error('Higgsfield: content rejected');
    if (json.status === 'canceled') throw new Error('Higgsfield: canceled');
    await sleep(intervalMs);
  }
  throw new Error('Higgsfield polling timeout');
}

export async function generateImage(prompt, opts = {}) {
  const endpoint = opts.endpoint || HF_MODEL;
  const requestId = await higgsfieldSubmit(endpoint, {
    prompt,
    aspect_ratio: opts.aspectRatio || '1:1',
    ...(opts.extra || {}),
  });
  const result = await higgsfieldPoll(requestId, opts);
  const images = result.images || [];
  return images.length ? images[0].url : null;
}

export async function generateTexture(prompt, opts = {}) {
  return generateImage('seamless texture, top-down view, ' + prompt + ', high detail, tileable', { aspectRatio: '1:1', ...opts });
}
