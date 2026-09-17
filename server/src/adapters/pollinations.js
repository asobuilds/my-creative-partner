import 'dotenv/config';

const { POLLINATIONS_KEY } = process.env;
const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');
export const pollinationsReady = true; // Works with or without key

const BASE = 'https://gen.pollinations.ai';

/**
 * Generate an image — returns a URL the frontend can load directly.
 */
export function pollinationsImage(prompt, { width = 768, height = 768, seed, model = 'flux' } = {}) {
  const encoded = encodeURIComponent(String(prompt || '').slice(0, 500));
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: 'true',
    safe: 'true',
    ...(seed ? { seed: String(seed) } : {}),
    ...(isReal(POLLINATIONS_KEY) ? { key: POLLINATIONS_KEY } : {}),
  });
  return BASE + '/image/' + encoded + '?' + params.toString();
}

/**
 * Generate a short MP4 from text — returns a URL.
 */
export function pollinationsVideo(prompt, { duration = 5 } = {}) {
  const encoded = encodeURIComponent(String(prompt || '').slice(0, 400) + ', smooth cinematic motion');
  const params = new URLSearchParams({
    duration: String(Math.min(Math.max(duration, 2), 10)),
    safe: 'true',
    ...(isReal(POLLINATIONS_KEY) ? { key: POLLINATIONS_KEY } : {}),
  });
  return BASE + '/video/' + encoded + '?' + params.toString();
}
