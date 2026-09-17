import { EdgeTTS } from 'node-edge-tts';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const OUT_DIR = path.join(os.tmpdir(), 'synthetix-tts');
if (!existsSync(OUT_DIR)) { try { await mkdir(OUT_DIR, { recursive: true }); } catch (e) {} }

const CHILD_VOICE = 'en-US-AnaNeural';   // actual child voice
const ALT_VOICE = 'en-US-AriaNeural';    // warm, gentle female
const RATE = '-8%';                       // slightly slower for kids

export async function speak(text, { voice = CHILD_VOICE, rate = RATE } = {}) {
  const clean = String(text || '').trim().slice(0, 600);
  if (!clean) throw new Error('text required');

  const hash = crypto.createHash('sha1').update(voice + '|' + rate + '|' + clean).digest('hex').slice(0, 20);
  const filePath = path.join(OUT_DIR, hash + '.mp3');

  if (existsSync(filePath)) return filePath;

  const tts = new EdgeTTS({
    voice,
    lang: 'en-US',
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    rate,
    pitch: '+0Hz',
  });

  await tts.ttsPromise(clean, filePath);
  return filePath;
}
