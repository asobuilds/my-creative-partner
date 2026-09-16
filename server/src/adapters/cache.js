import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import crypto from 'node:crypto';

const CACHE_DIR = join(tmpdir(), 'synthetix-cache');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

if (!existsSync(CACHE_DIR)) { try { mkdirSync(CACHE_DIR, { recursive: true }); } catch (e) {} }

function keyHash(text) {
  return crypto.createHash('sha1').update(String(text).trim().toLowerCase()).digest('hex').slice(0, 24);
}

export function cacheGet(kind, key) {
  try {
    const f = join(CACHE_DIR, kind + '-' + keyHash(key) + '.json');
    if (!existsSync(f)) return null;
    const j = JSON.parse(readFileSync(f, 'utf8'));
    if (Date.now() - j.ts > CACHE_TTL_MS) return null;
    console.log('[cache] HIT', kind, keyHash(key));
    return j.value;
  } catch (e) { return null; }
}

export function cacheSet(kind, key, value) {
  try {
    const f = join(CACHE_DIR, kind + '-' + keyHash(key) + '.json');
    writeFileSync(f, JSON.stringify({ ts: Date.now(), value }), 'utf8');
  } catch (e) {}
}
