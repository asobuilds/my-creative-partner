import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CACHE_DIR = path.join(os.tmpdir(), 'synthetix-models');
if (!existsSync(CACHE_DIR)) { try { await mkdir(CACHE_DIR, { recursive: true }); } catch (e) {} }

const UA = '9jaWonderPal/1.0 (+https://9jawonderpal.local)';

/**
 * Get the download URLs for a PolyHaven model by ID.
 * Endpoint returns nested file metadata.
 */
export async function getPolyHavenFiles(id) {
  const res = await fetch('https://api.polyhaven.com/files/' + encodeURIComponent(id), {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error('PolyHaven files ' + res.status);
  return await res.json();
}

function pickGlb(filesJson) {
  // PolyHaven returns { gltf: { '1k': { glb: { url, ... }, gltf: {...} }, '2k': {...} } }
  const gltf = filesJson && filesJson.gltf;
  if (!gltf) return null;
  for (const res of ['1k', '2k', '4k', '8k']) {
    if (gltf[res] && gltf[res].glb && gltf[res].glb.url) return gltf[res].glb.url;
  }
  // Fallback: any resolution key
  for (const k of Object.keys(gltf)) {
    if (gltf[k] && gltf[k].glb && gltf[k].glb.url) return gltf[k].glb.url;
  }
  return null;
}

/**
 * Download a PolyHaven GLB to the local cache. Returns the relative URL for static serving.
 */
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
