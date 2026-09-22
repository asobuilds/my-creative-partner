/**
 * Sound engine — Web Audio synthesis + single shared Audio element for MP3s.
 * Only ONE audio element plays at a time per named effect.
 * TTS narration uses a separate element (see BookView).
 */

let ctx = null;
let muted = false;
let unlocked = false;

// Pool of one Audio per sound name — reused, never leaked
const audioPool = {};

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  if (unlocked) return;
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  unlocked = true;
}

if (typeof window !== 'undefined') {
  const unlockOnce = () => { unlockAudio(); };
  window.addEventListener('click', unlockOnce, { once: true });
  window.addEventListener('touchstart', unlockOnce, { once: true });
  window.addEventListener('keydown', unlockOnce, { once: true });
}

export function setMuted(v) { muted = Boolean(v); }
export function isMuted() { return muted; }

/* ── Synth fallback ── */
function tone({ freq, dur, type = 'sine', vol = 0.15, delay = 0, sweepTo = null }) {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst({ dur = 0.08, vol = 0.06, delay = 0 } = {}) {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const bufferSize = c.sampleRate * dur;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur);
}

/* ── Reused audio elements — never leak ── */
function playMp3(name) {
  if (typeof window === 'undefined' || muted) return false;
  try {
    let a = audioPool[name];
    if (!a) {
      a = new Audio('/sounds/' + name + '.mp3');
      a.preload = 'auto';
      a.volume = 0.65;
      audioPool[name] = a;
    }
    // Reset to start so retriggers work
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

/** Preload all 10 sounds on first user interaction (avoids first-play latency). */
export function preloadAll() {
  if (typeof window === 'undefined') return;
  const names = ['tap','correct','wrong','combo','badge','stage-complete','page-turn','points','start','streak'];
  names.forEach((n) => {
    if (!audioPool[n]) {
      const a = new Audio('/sounds/' + n + '.mp3');
      a.preload = 'auto';
      a.volume = 0.65;
      audioPool[n] = a;
    }
  });
}

/* ── Named effects ── */
export function tap() { if (playMp3('tap')) return; tone({ freq: 720, dur: 0.05, type: 'triangle', vol: 0.09 }); }
export function correct() { if (playMp3('correct')) return; tone({ freq: 660, dur: 0.12, type: 'sine', vol: 0.14 }); tone({ freq: 880, dur: 0.16, type: 'sine', vol: 0.12, delay: 0.09 }); }
export function wrong() { if (playMp3('wrong')) return; tone({ freq: 220, dur: 0.18, type: 'triangle', vol: 0.12, sweepTo: 140 }); }
export function combo(level = 2) { if (playMp3('combo')) return; const base = 440; for (let i = 0; i < Math.min(level, 6); i++) tone({ freq: base * Math.pow(1.18, i), dur: 0.09, type: 'square', vol: 0.08, delay: i * 0.055 }); }
export function badge() { if (playMp3('badge')) return; [523,659,784,1047].forEach((f,i) => tone({ freq: f, dur: 0.28, type: 'sine', vol: 0.14, delay: i * 0.1 })); }
export function stageComplete() { if (playMp3('stage-complete')) return; [659,784,988,1319].forEach((f,i) => tone({ freq: f, dur: 0.24, type: 'triangle', vol: 0.13, delay: i * 0.09 })); }
export function pageTurn() { if (playMp3('page-turn')) return; noiseBurst({ dur: 0.12, vol: 0.05 }); }
export function pointsEarned() { if (playMp3('points')) return; tone({ freq: 880, dur: 0.08, type: 'sine', vol: 0.1 }); tone({ freq: 1174, dur: 0.12, type: 'sine', vol: 0.09, delay: 0.06 }); }
export function startGame() { if (playMp3('start')) return; tone({ freq: 440, dur: 0.1, type: 'triangle', vol: 0.1 }); tone({ freq: 784, dur: 0.18, type: 'triangle', vol: 0.1, delay: 0.18 }); }
export function streak() { if (playMp3('streak')) return; tone({ freq: 523, dur: 0.12, type: 'square', vol: 0.08 }); tone({ freq: 1047, dur: 0.22, type: 'square', vol: 0.08, delay: 0.18 }); }
