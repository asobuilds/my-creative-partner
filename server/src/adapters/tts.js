import 'dotenv/config';

const {
  ELEVENLABS_API_KEY,
  ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1',
  ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM',
  ELEVENLABS_MODEL = 'eleven_turbo_v2_5',
} = process.env;

const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');
export const ttsReady = isReal(ELEVENLABS_API_KEY);

export async function synthesize(text, opts = {}) {
  if (!ttsReady) throw new Error('ELEVENLABS_API_KEY missing');
  const voiceId = opts.voiceId || ELEVENLABS_VOICE_ID;
  const url = ELEVENLABS_BASE_URL.replace(/\/$/, '') + '/text-to-speech/' + voiceId;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: opts.model || ELEVENLABS_MODEL,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error('ElevenLabs ' + res.status + ': ' + t.slice(0, 240));
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}
