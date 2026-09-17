/**
 * Server-side image proxy + disk cache with multi-source fallback.
 * Pollinations → Pexels → Pixabay → SVG placeholder.
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { searchAll } from './media.js';

const CACHE_DIR = path.join(os.tmpdir(), 'synthetix-images');
if (!existsSync(CACHE_DIR)) { try { await mkdir(CACHE_DIR, { recursive: true }); } catch (e) {} }

function hashUrl(url) {
  return crypto.createHash('sha1').update(String(url)).digest('hex').slice(0, 24);
}

export function imageCachePath(url) {
  return path.join(CACHE_DIR, hashUrl(url) + '.png');
}
export function imageCacheUrl(url) {
  return '/images/' + hashUrl(url) + '.png';
}

function makePlaceholder(text, hash) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><radialGradient id="g" cx="50%" cy="40%"><stop offset="0%" stop-color="#1f1b2e"/><stop offset="100%" stop-color="#0a0812"/></radialGradient></defs><rect width="1024" height="1024" fill="url(#g)"/><text x="512" y="480" text-anchor="middle" fill="#00f0ff" font-family="system-ui" font-size="52" font-weight="800" opacity="0.35">${text.replace(/[<>&"']/g, '')}</text><text x="512" y="560" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="22" opacity="0.6">painting the picture…</text></svg>`;
  return Buffer.from(svg, 'utf8');
}

async function tryFetch(url, { timeoutMs = 45000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 9jaWonderPal/1.0',
        'Accept': 'image/*',
        'Referer': 'https://9jawonderpal.local/',
      },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 800) throw new Error('Too small: ' + buf.length);
    return buf;
  } finally { clearTimeout(t); }
}

/**
 * Cache any image URL to disk. Falls back to Pexels/Pixabay on failure.
 * @returns {Promise<string>} local URL (always succeeds)
 */
export async function ensureCached(url, { subject, timeoutMs = 45000 } = {}) {
  if (!url) throw new Error('url required');
  const file = imageCachePath(url);
  if (existsSync(file)) return imageCacheUrl(url);

  // Attempt 1: primary URL (Pollinations), with backoff
  const delays = [0, 2000, 5000];
  for (let i = 0; i < delays.length; i++) {
    if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]));
    try {
      const buf = await tryFetch(url, { timeoutMs });
      await writeFile(file, buf);
      console.log('[img] cached', buf.length, 'bytes (attempt ' + (i + 1) + ') ->', imageCacheUrl(url));
      return imageCacheUrl(url);
    } catch (e) {
      console.warn('[img] attempt', i + 1, 'failed:', e.message);
    }
  }

  // Attempt 2: fall back to stock photos (Pexels / Pixabay)
  if (subject) {
    try {
      const photos = await searchAll(subject, { perPage: 4 });
      for (const p of photos) {
        if (!p || !p.url) continue;
        try {
          const buf = await tryFetch(p.url, { timeoutMs: 20000 });
          await writeFile(file, buf);
          console.log('[img] cached from stock (' + (p.source || '?') + ')', buf.length, 'bytes ->', imageCacheUrl(url));
          return imageCacheUrl(url);
        } catch (e) {
          // try next photo
        }
      }
    } catch (e) {
      console.warn('[img] stock fallback failed:', e.message);
    }
  }

  // Attempt 3: SVG placeholder — always succeeds
  const placeholder = makePlaceholder(subject || 'Imagining', hashUrl(url));
  await writeFile(file, placeholder);
  console.log('[img] using SVG placeholder ->', imageCacheUrl(url));
  return imageCacheUrl(url);
}

export async function readCached(url) {
  const file = imageCachePath(url);
  if (!existsSync(file)) return null;
  return await readFile(file);
}

export const IMAGE_CACHE_DIR = CACHE_DIR;
