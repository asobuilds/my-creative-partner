import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CACHE_DIR = path.join(os.tmpdir(), 'synthetix-models');
if (!existsSync(CACHE_DIR)) { try { await mkdir(CACHE_DIR, { recursive: true }); } catch (e) {} }

const UA = '9jaWonderPal/1.0';

export async function getPolyHavenFiles(id) {
  const res = await fetch('https://api.polyhaven.com/files/' + encodeURIComponent(id), {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error('PolyHaven files ' + res.status);
  return await res.json();
}

function pickGlb(filesJson) {
  const gltf = filesJson && filesJson.gltf;
  if (!gltf) return null;
  for (const res of ['1k', '2k', '4k', '8k']) {
    if (gltf[res] && gltf[res].glb && gltf[res].glb.url) return gltf[res].glb.url;
  }
  for (const k of Object.keys(gltf)) {
    if (gltf[k] && gltf[k].glb && gltf[k].glb.url) return gltf[k].glb.url;
  }
  return null;
}

/**
 * Search PolyHaven using the official /search endpoint (ranked, word-aware).
 * Falls back to /assets with strict word-boundary matching.
 */
export async function findPolyHavenMatch(subject) {
  const word = String(subject || '').toLowerCase().trim();
  if (!word) return null;

  // Try official search first (added 2026, uses proper ranking)
  try {
    const r = await fetch('https://api.polyhaven.com/search?q=' + encodeURIComponent(word) + '&t=models&limit=10', {
      headers: { 'User-Agent': UA },
    });
    if (r.ok) {
      const json = await r.json();
      const list = json.results || json.assets || (Array.isArray(json) ? json : []);
      for (const item of list) {
        const id = item.id || item.slug || item.asset;
        if (id) {
          console.log('[polyhaven] search hit:', id);
          return id;
        }
      }
    }
  } catch (e) {
    console.warn('[polyhaven] search endpoint failed:', e.message);
  }

  // Fallback: strict word-boundary matching over the full asset list
  try {
    const listRes = await fetch('https://api.polyhaven.com/assets?t=models', {
      headers: { 'User-Agent': UA },
    });
    if (!listRes.ok) return null;
    const all = await listRes.json();
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const boundary = new RegExp('\\b' + escaped + '\\b', 'i');

    let best = null;
    let bestScore = 0;
    for (const [id, meta] of Object.entries(all)) {
      const haystack = id + ' ' + (meta.name || '') + ' ' + (meta.categories || []).join(' ') + ' ' + (meta.tags || []).join(' ');
      if (!boundary.test(haystack)) continue;
      // Prefer shorter ids that start with the word (more likely a direct match)
      const score = id.toLowerCase().startsWith(word) ? 100 : (id.length < 30 ? 50 : 20);
      if (score > bestScore) { bestScore = score; best = id; }
    }
    if (best) console.log('[polyhaven] fuzzy hit:', best);
    return best;
  } catch (e) {
    console.warn('[polyhaven] fuzzy match failed:', e.message);
    return null;
  }
}

export async function downloadPolyHavenModel(id) {
  const localName = id.replace(/[^a-z0-9_-]/gi, '_') + '.glb';
  const localPath = path.join(CACHE_DIR, localName);
  if (existsSync(localPath)) return '/models/' + localName;

  const files = await getPolyHavenFiles(id);
  const url = pickGlb(files);
  if (!url) throw new Error('No GLB available for ' + id);

  console.log('[download3d] fetching', url.slice(0, 80) + '...');
  const res = await fetch(url);
  if (!res.ok) throw new Error('GLB download ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(localPath, buf);
  console.log('[download3d] cached', localName, buf.length, 'bytes');
  return '/models/' + localName;
}

export const MODEL_CACHE_DIR = CACHE_DIR;
