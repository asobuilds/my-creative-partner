/**
 * Hunyuan3D-2 via HuggingFace Space (tencent/Hunyuan3D-2).
 * The Space is image-to-3D. We generate an image first (Pollinations),
 * then feed it to /shape_generation.
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { aiImageUrl } from './freeImage.js';

const SPACE = 'tencent/Hunyuan3D-2';
const SPACE_HOST = SPACE.replace('/', '-').toLowerCase() + '.hf.space';
const BASE = 'https://' + SPACE_HOST;
const TMP = path.join(os.tmpdir(), 'synthetix-hunyuan');
if (!existsSync(TMP)) { try { await mkdir(TMP, { recursive: true }); } catch (e) {} }

const {
  HF_TOKEN,
} = process.env;

const hfHeaders = () => (HF_TOKEN ? { Authorization: 'Bearer ' + HF_TOKEN } : {});

export const hunyuanReady = true;

async function wake() {
  try { await fetch(BASE + '/', { signal: AbortSignal.timeout(8000), headers: hfHeaders() }); } catch (e) {}
}

/**
 * Download a Pollinations image and upload it to the Space, returning
 * a file reference the Space accepts.
 */
async function uploadImageToSpace(imageUrl) {
  // Pollinations accepts direct URL — pass it as the image field.
  // Gradio's /upload accepts multipart; but it also accepts URLs via /gradio_api.
  const filename = 'input-' + Date.now() + '.png';
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error('Image download failed: ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(TMP, filename);
  await writeFile(filePath, buf);

  // Upload to Space
  const form = new FormData();
  form.append('files', new Blob([buf], { type: 'image/png' }), filename);
  const up = await fetch(BASE + '/gradio_api/upload', {
    method: 'POST',
    body: form,
    headers: hfHeaders(),
  });
  if (!up.ok) throw new Error('Upload failed: ' + up.status);
  const uploaded = await up.json();
  const serverPath = Array.isArray(uploaded) ? uploaded[0] : (uploaded.files ? uploaded.files[0] : uploaded.path);
  if (!serverPath) throw new Error('Upload did not return a path');
  console.log('[hunyuan] uploaded:', serverPath);
  return serverPath;
}

async function callShapeGeneration(serverPath, caption) {
  const payload = {
    data: [
      caption || '',       // caption
      { path: serverPath, meta: { _type: 'gradio.FileData' } },  // image
      20,                  // steps
      5.0,                 // guidance_scale
      1234,                // seed
      '256',               // octree_resolution
      true,                // check_box_rembg
    ],
  };

  const queue = await fetch(BASE + '/gradio_api/call/shape_generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...hfHeaders() },
    body: JSON.stringify(payload),
  });
  if (!queue.ok) {
    const t = await queue.text().catch(() => '');
    throw new Error('Hunyuan queue ' + queue.status + ': ' + t.slice(0, 200));
  }
  const { event_id } = await queue.json();
  if (!event_id) throw new Error('No event_id');

  // Stream the result
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 240000);
  try {
    const stream = await fetch(BASE + '/gradio_api/call/shape_generation/' + event_id, {
      headers: { Accept: 'text/event-stream', ...hfHeaders() },
      signal: controller.signal,
    });
    const reader = stream.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() || '';
      for (const chunk of parts) {
        let event = null;
        let dataLine = null;
        for (const l of chunk.split('\n')) {
          if (l.startsWith('event:')) event = l.slice(6).trim();
          if (l.startsWith('data:')) dataLine = l.slice(5).trim();
        }
        if (event === 'complete' && dataLine) {
          try { return JSON.parse(dataLine); } catch { return dataLine; }
        }
        if (event === 'error') throw new Error('Hunyuan error: ' + (dataLine || 'unknown'));
      }
    }
  } finally { clearTimeout(timer); }
  throw new Error('Hunyuan stream ended without result');
}

export async function generateHunyuanMesh(prompt) {
  const clean = String(prompt || '').trim().slice(0, 200);
  if (!clean) throw new Error('prompt required');

  await wake();

  // Step 1: generate a concept image via Pollinations (reliable, free, fast)
  const imageUrl = aiImageUrl(clean + ', single centered object, plain white background, high detail, no text, front view', { width: 1024, height: 1024 });
  console.log('[hunyuan] step 1 — concept image:', imageUrl.slice(0, 90) + '...');

  // Step 2: upload to the Space
  const serverPath = await uploadImageToSpace(imageUrl);

  // Step 3: call shape_generation
  console.log('[hunyuan] step 3 — shape generation...');
  const output = await callShapeGeneration(serverPath, clean);

  // Extract GLB URL from response
  const flat = JSON.stringify(output);
  const glbMatch = flat.match(/"?(https?:\/\/[^"\\]+\.glb[^"\\]*)"?/i);
  if (glbMatch) return { glbUrl: glbMatch[1], raw: output };

  const dataArr = Array.isArray(output) ? output : (output.data || []);
  for (const item of dataArr) {
    if (item && item.url && /\.glb/i.test(item.url)) return { glbUrl: item.url, raw: output };
    if (typeof item === 'string' && /\.glb/i.test(item)) return { glbUrl: item, raw: output };
  }
  console.warn('[hunyuan] no GLB in output:', flat.slice(0, 300));
  return { glbUrl: null, raw: output };
}
