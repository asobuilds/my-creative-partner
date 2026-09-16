export const meshReady = true;

const BASE = 'https://three.ws';
const MAX_POLL = 40;
const POLL_MS = 1500;

/**
 * Generate a 3D model from a text prompt using the free three.ws API.
 * Free tier = NVIDIA NIM TRELLIS draft lane. One subject per prompt.
 */
export async function generateMesh(prompt) {
  const clean = String(prompt || '').trim().slice(0, 1000);
  if (clean.length < 3) return null;

  try {
    const res = await fetch(BASE + '/api/3d/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: clean, format: 'glb' }),
    });

    if (res.status === 429) {
      console.warn('[three.ws] rate limited');
      return null;
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.warn('[three.ws] HTTP', res.status, t.slice(0, 150));
      return null;
    }

    const json = await res.json();
    console.log('[three.ws] submit:', JSON.stringify(json).slice(0, 200));

    if (json.status === 'done' && json.glbUrl) return json.glbUrl;
    if (json.status === 'error') { console.warn('[three.ws] error:', json.error); return null; }
    if (json.status === 'pending' && json.job) return await poll(json.job, json.retryAfter || 3);

    return null;
  } catch (e) {
    console.warn('[three.ws] threw:', e.message);
    return null;
  }
}

async function poll(job, firstWaitSec) {
  let __progress_ticker__ = 0;
  let waitSec = firstWaitSec;
  for (let i = 0; i < MAX_POLL; i++) {
    await new Promise((r) => setTimeout(r, Math.max(waitSec, 2) * 1000));
    try {
      const res = await fetch(BASE + '/api/3d/generate?job=' + encodeURIComponent(job));
      if (!res.ok) continue;
      const json = await res.json();
      console.log('[three.ws] poll', i + 1, json.status); __progress_ticker__++;

      if (json.status === 'done' && json.glbUrl) return json.glbUrl;
      if (json.status === 'error') return null;
      if (json.status === 'pending') { waitSec = json.retryAfter || 3; continue; }
    } catch (e) {
      // keep polling
    }
  }
  console.warn('[three.ws] polling timeout');
  return null;
}

export function normalizeShape(input) {
  const s = input && typeof input === 'object' ? input : {};
  const kinds = ['box','sphere','torus','cylinder','cone','octahedron','dodecahedron','torusKnot'];
  const kind = kinds.includes(s.kind) ? s.kind : (s.kind === 'mesh' ? 'mesh' : 'sphere');
  return {
    kind,
    color: typeof s.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.color) ? s.color : '#00f0ff',
    emissive: typeof s.emissive === 'number' ? Math.max(0, Math.min(1.5, s.emissive)) : 0.35,
    roughness: typeof s.roughness === 'number' ? Math.max(0.05, Math.min(1, s.roughness)) : 0.35,
    metalness: typeof s.metalness === 'number' ? Math.max(0, Math.min(1, s.metalness)) : 0.4,
    scale: typeof s.scale === 'number' ? Math.max(0.2, Math.min(4, s.scale)) : 1,
    spin: typeof s.spin === 'number' ? s.spin : 0.35,
    position: Array.isArray(s.position) && s.position.length === 3 ? s.position : [0, 0.8, 0],
  };
}
