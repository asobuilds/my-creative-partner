/**
 * Pollinations.AI — free, keyless image generation.
 * URL pattern: https://image.pollinations.ai/prompt/{prompt}?width=768&height=768&model=flux&safe=true
 */

export function aiImageUrl(prompt, { width = 768, height = 768, seed, model = 'flux' } = {}) {
  const encoded = encodeURIComponent(String(prompt || '').slice(0, 500));
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: 'true',
    safe: 'true',
    enhance: 'true',
    ...(seed ? { seed: String(seed) } : {}),
  });
  return 'https://image.pollinations.ai/prompt/' + encoded + '?' + params.toString();
}

export async function generateAIImage(prompt, opts = {}) {
  return aiImageUrl(prompt, opts);
}
