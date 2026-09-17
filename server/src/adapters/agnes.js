import 'dotenv/config';

const {
  AGNES_API_KEY,
  AGNES_BASE_URL = 'https://apihub.agnes-ai.com',
} = process.env;

const isReal = (v) => Boolean(v) && String(v).trim().length > 4 && !/^(PASTE|YOUR_|REPLACE|xxx)/i.test(String(v));
export const agnesReady = isReal(AGNES_API_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const auth = () => ({ Authorization: 'Bearer ' + AGNES_API_KEY, 'Content-Type': 'application/json' });

/**
 * Generate a short video from text using Agnes AI (free, unlimited).
 * @param {string} prompt - cinematic description
 * @param {object} opts - { width, height, numFrames, frameRate, imageUrl }
 * @returns {Promise<{videoUrl, videoId}>}
 */
export async function generateAgnesVideo(prompt, opts = {}) {
  if (!agnesReady) throw new Error('AGNES_API_KEY missing');

  const body = {
    model: 'agnes-video-v2.0',
    prompt: String(prompt).slice(0, 800),
    width: opts.width || 1152,
    height: opts.height || 768,
    num_frames: opts.numFrames || 121,
    frame_rate: opts.frameRate || 24,
    negative_prompt: opts.negativePrompt || 'blurry, distorted, low quality, watermark, text',
  };

  // Image-to-video mode if an image URL is provided
  if (opts.imageUrl) {
    body.image = opts.imageUrl;
    body.mode = 'ti2vid';
  }

  console.log('[agnes] creating video task...');
  const createRes = await fetch(AGNES_BASE_URL + '/v1/videos', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const t = await createRes.text().catch(() => '');
    throw new Error('Agnes create ' + createRes.status + ': ' + t.slice(0, 200));
  }

  const createJson = await createRes.json();
  const videoId = createJson.video_id || createJson.task_id || (createJson.data && (createJson.data.video_id || createJson.data.task_id));
  if (!videoId) throw new Error('Agnes did not return a video_id');

  console.log('[agnes] task created:', videoId);
  return await pollAgnesVideo(videoId, opts);
}

async function pollAgnesVideo(videoId, { maxAttempts = 90, delayMs = 3000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(delayMs);
    const res = await fetch(AGNES_BASE_URL + '/agnesapi?video_id=' + encodeURIComponent(videoId), {
      headers: { Authorization: 'Bearer ' + AGNES_API_KEY },
    });
    if (!res.ok) continue;

    const json = await res.json();
    const status = json.status || (json.data && json.data.status);
    console.log('[agnes] poll', i + 1, ':', status);

    if (status === 'completed' || status === 'success') {
      const url = json.video_url || json.url || (json.data && (json.data.video_url || json.data.url));
      if (url) return { videoUrl: url, videoId };
    }
    if (status === 'failed' || status === 'error') {
      throw new Error('Agnes video failed: ' + (json.error || json.message || 'unknown'));
    }
  }
  throw new Error('Agnes polling timeout after ' + maxAttempts + ' attempts');
}
