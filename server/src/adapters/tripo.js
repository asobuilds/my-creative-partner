import 'dotenv/config';

const {
  TRIPO_API_KEY,
  TRIPO_BASE_URL = 'https://openapi.tripo3d.ai/v3',
  TRIPO_MODEL = 'v3.1-20260211',
} = process.env;

const isReal = (v) => Boolean(v) && String(v).trim().length > 4 && !/^(PASTE|YOUR_|REPLACE|xxx)/i.test(String(v));
export const tripoReady = isReal(TRIPO_API_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const auth = () => ({ Authorization: 'Bearer ' + TRIPO_API_KEY, 'Content-Type': 'application/json' });

/**
 * Generate a real textured 3D mesh from text.
 * @param {string} prompt - describe shape, material, style, scale
 * @param {object} opts - { faceLimit, textureQuality, pbr }
 * @returns {Promise<{modelUrl, renderedImageUrl, taskId}>}
 */
export async function generateTripoMesh(prompt, opts = {}) {
  if (!tripoReady) throw new Error('TRIPO_API_KEY missing');

  const body = {
    prompt: String(prompt).slice(0, 1024),
    model: TRIPO_MODEL,
    negative_prompt: 'blurry, low quality, broken mesh, distorted, deformed',
    texture: true,
    pbr: true,
    face_limit: opts.faceLimit || 50000,
    texture_quality: opts.textureQuality || 'standard',
    geometry_quality: opts.geometryQuality || 'standard',
  };

  console.log('[tripo] creating task...');
  const createRes = await fetch(TRIPO_BASE_URL + '/generation/text-to-model', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const t = await createRes.text().catch(() => '');
    throw new Error('Tripo create ' + createRes.status + ': ' + t.slice(0, 200));
  }

  const createJson = await createRes.json();
  if (createJson.code !== 0) {
    throw new Error('Tripo error ' + createJson.code + ': ' + (createJson.message || 'unknown'));
  }

  const taskId = createJson.data.task_id;
  console.log('[tripo] task created:', taskId);
  return await pollTripoTask(taskId, opts);
}

async function pollTripoTask(taskId, { maxAttempts = 60, delayMs = 2500 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(delayMs);
    const res = await fetch(TRIPO_BASE_URL + '/tasks/' + taskId, { headers: auth() });
    if (!res.ok) continue;

    const json = await res.json();
    if (json.code !== 0) continue;

    const task = json.data;
    console.log('[tripo] poll', i + 1, ':', task.status, task.progress + '%');

    if (task.status === 'success') {
      const output = task.output || {};
      return {
        modelUrl: output.model_url || output.pbr_model || null,
        renderedImageUrl: output.rendered_image_url || null,
        taskId,
      };
    }
    if (task.status === 'failed' || task.status === 'cancelled' || task.status === 'banned') {
      throw new Error('Tripo task ' + task.status);
    }
  }
  throw new Error('Tripo polling timeout after ' + maxAttempts + ' attempts');
}
