/**
 * Pollinations.AI — free, keyless image generation.
 * Kept minimal: fewer params = fewer failures.
 */

export function aiImageUrl(prompt, { width = 768, height = 768, seed, model = 'flux' } = {}) {
  const safe = String(prompt || '')
    .replace(/[^\w\s,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  if (!safe) return null;
  const encoded = encodeURIComponent(safe);
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    safe: 'true',
    ...(seed ? { seed: String(seed) } : {}),
  });
  return 'https://image.pollinations.ai/prompt/' + encoded + '?' + params.toString();
}

export async function generateAIImage(prompt, opts = {}) {
  return aiImageUrl(prompt, opts);
}
