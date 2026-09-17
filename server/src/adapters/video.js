import 'dotenv/config';

const {
  SHOTSTACK_API_KEY,
  SHOTSTACK_ENV = 'stage',
  SHOTSTACK_BASE_URL = 'https://api.shotstack.io/edit',
} = process.env;

const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');
export const videoReady = isReal(SHOTSTACK_API_KEY);

export async function renderStory({ imageUrl, title, subtitle, durationSec = 6 }) {
  if (!videoReady) throw new Error('SHOTSTACK_API_KEY missing');

  const endpoint = SHOTSTACK_BASE_URL.replace(/\/$/, '') + '/' + SHOTSTACK_ENV + '/render';

  const body = {
    timeline: {
      background: '#070b14',
      soundtrack: undefined,
      tracks: [
        {
          clips: [
            {
              asset: { type: 'image', src: (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) ? imageUrl : imageUrl },
              start: 0,
              length: durationSec,
              effect: 'zoomInSlow',
              transition: { in: 'fade', out: 'fade' },
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'title',
                text: title || 'Synthetix',
                style: 'minimal',
                color: '#00f0ff',
                size: 'large',
              },
              start: 0.6,
              length: Math.max(1.5, durationSec - 1.2),
              position: 'center',
              transition: { in: 'slideUp', out: 'fade' },
            },
            ...(subtitle
              ? [
                  {
                    asset: {
                      type: 'title',
                      text: subtitle,
                      style: 'minimal',
                      color: '#e2e8f0',
                      size: 'small',
                    },
                    start: 1.2,
                    length: Math.max(1.5, durationSec - 2),
                    position: 'bottom',
                    transition: { in: 'fade', out: 'fade' },
                  },
                ]
              : []),
          ],
        },
      ],
    },
    output: {
      format: 'mp4',
      fps: 30,
      size: { width: 1080, height: 1920 },
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'x-api-key': SHOTSTACK_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error('Shotstack ' + res.status + ': ' + t.slice(0, 240));
  }
  const json = await res.json();
  return json.response && json.response.id;
}

export async function pollStory(renderId, { timeoutMs = 120000, intervalMs = 3000 } = {}) {
  if (!videoReady) throw new Error('SHOTSTACK_API_KEY missing');
  const endpoint = SHOTSTACK_BASE_URL.replace(/\/$/, '') + '/' + SHOTSTACK_ENV + '/render/' + renderId + '?data=false';
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(endpoint, { headers: { 'x-api-key': SHOTSTACK_API_KEY } });
    const json = await res.json();
    const status = json.response && json.response.status;
    if (status === 'done') return json.response.url;
    if (status === 'failed') throw new Error('Shotstack render failed');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Shotstack timeout');
}
