import 'dotenv/config';
import { aiImageUrl } from './freeImage.js';
import { searchAll as searchStock, mediaReady } from './media.js';

const {
  SKETCHFAB_API_TOKEN,
  HF_TOKEN,
} = process.env;

const isReal = (v) => Boolean(v) && String(v).trim().length > 4 && !/^(PASTE|YOUR_|REPLACE)/i.test(String(v));

export const assetSources = {
  sketchfab: isReal(SKETCHFAB_API_TOKEN),
  huggingface: isReal(HF_TOKEN),
  pollinations: true,
  pexels: mediaReady.pexels,
  pixabay: mediaReady.pixabay,
};

const UA = '9jaWonderPal/1.0 (+https://github.com/asobuilds)';

async function searchPolyHaven(query) {
  try {
    const listRes = await fetch('https://api.polyhaven.com/assets?t=models', {
      headers: { 'User-Agent': UA },
    });
    if (!listRes.ok) return [];
    const all = await listRes.json();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = Object.entries(all)
      .filter(([id, meta]) => {
        const haystack = (id + ' ' + (meta.name || '') + ' ' + (meta.categories || []).join(' ') + ' ' + (meta.tags || []).join(' ')).toLowerCase();
        return words.some((w) => haystack.includes(w));
      })
      .slice(0, 6);
    return matches.map(([id, meta]) => ({
      id: 'polyhaven-' + id,
      kind: 'model',
      title: meta.name || id,
      thumb: meta.thumbnail_url ? 'https://cdn.polyhaven.com/asset_img/thumbs/' + id + '.png?width=256' : null,
      src: null,
      source: 'polyhaven',
      license: 'CC0',
      credit: 'Poly Haven',
      meta: { id, categories: meta.categories || [], downloadPage: 'https://polyhaven.com/a/' + id },
    }));
  } catch (e) {
    console.warn('[assets] polyhaven:', e.message);
    return [];
  }
}

async function searchSketchfab(query) {
  if (!isReal(SKETCHFAB_API_TOKEN)) return [];
  try {
    const url = 'https://api.sketchfab.com/v3/search?type=models&q=' + encodeURIComponent(query) + '&downloadable=true&count=6';
    const res = await fetch(url, { headers: { Authorization: 'Token ' + SKETCHFAB_API_TOKEN, 'User-Agent': UA } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []).slice(0, 6).map((m) => ({
      id: 'sketchfab-' + m.uid,
      kind: 'model',
      title: m.name,
      thumb: (m.thumbnails && m.thumbnails.images && m.thumbnails.images[0] && m.thumbnails.images[0].url) || null,
      src: m.viewerUrl,
      source: 'sketchfab',
      license: (m.license && m.license.label) || 'See model',
      credit: m.user && m.user.displayName,
      meta: { uid: m.uid, viewerUrl: m.viewerUrl, isDownloadable: m.isDownloadable },
    }));
  } catch (e) {
    console.warn('[assets] sketchfab:', e.message);
    return [];
  }
}

function searchPollinations(query) {
  return [
    {
      id: 'pollinations-' + Date.now(),
      kind: 'image',
      title: 'AI: ' + query,
      thumb: aiImageUrl(query + ', high detail, no text', { width: 512, height: 512 }),
      src: aiImageUrl(query + ', high detail, no text', { width: 1024, height: 1024 }),
      source: 'pollinations',
      license: 'Free',
      credit: 'Pollinations',
      meta: {},
    },
  ];
}

async function searchStockPhotos(query) {
  try {
    const photos = await searchStock(query, { perPage: 4 });
    return photos.map((p) => ({
      id: p.id,
      kind: 'image',
      title: p.alt || query,
      thumb: p.thumb,
      src: p.url,
      source: p.source,
      license: 'Free',
      credit: p.credit,
      meta: {},
    }));
  } catch (e) {
    return [];
  }
}

export async function searchAssets(query, { limit = 20 } = {}) {
  const q = String(query || '').trim().slice(0, 120);
  if (!q) return { results: [], sources: assetSources };

  const tasks = [
    searchPolyHaven(q),
    searchSketchfab(q),
    Promise.resolve(searchPollinations(q)),
    searchStockPhotos(q),
  ];
  const settled = await Promise.allSettled(tasks);
  const results = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).slice(0, limit);
  return { results, sources: assetSources, query: q };
}
