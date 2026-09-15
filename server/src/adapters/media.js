import 'dotenv/config';

const { PEXELS_API_KEY, PIXABAY_API_KEY } = process.env;
const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');

export const mediaReady = { pexels: isReal(PEXELS_API_KEY), pixabay: isReal(PIXABAY_API_KEY) };

export async function searchPexels(query, { perPage = 8, orientation = 'landscape' } = {}) {
  if (!mediaReady.pexels) throw new Error('PEXELS_API_KEY missing');
  const url = 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=' + perPage + '&orientation=' + orientation;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) throw new Error('Pexels ' + res.status);
  const json = await res.json();
  return (json.photos || []).map((p) => ({
    id: 'pexels-' + p.id,
    url: p.src && p.src.large2x,
    thumb: p.src && p.src.medium,
    width: p.width,
    height: p.height,
    alt: p.alt,
    credit: p.photographer,
    source: 'pexels',
  }));
}

export async function searchPixabay(query, { perPage = 8, orientation = 'horizontal' } = {}) {
  if (!mediaReady.pixabay) throw new Error('PIXABAY_API_KEY missing');
  const url = 'https://pixabay.com/api/?key=' + PIXABAY_API_KEY + '&q=' + encodeURIComponent(query) + '&per_page=' + perPage + '&orientation=' + orientation + '&image_type=photo&safesearch=true';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Pixabay ' + res.status);
  const json = await res.json();
  return (json.hits || []).map((p) => ({
    id: 'pixabay-' + p.id,
    url: p.largeImageURL,
    thumb: p.webformatURL,
    width: p.imageWidth,
    height: p.imageHeight,
    alt: p.tags,
    credit: p.user,
    source: 'pixabay',
  }));
}

export async function searchAll(query, opts) {
  const results = await Promise.allSettled([
    searchPexels(query, opts).catch(() => []),
    searchPixabay(query, opts).catch(() => []),
  ]);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
