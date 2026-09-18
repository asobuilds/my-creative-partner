import { create } from 'zustand';
import { applyTheme, applyTextSize, applyReduceMotion } from '../engine/themes';

const KEY = '9jawonderpal.settings.v1';
const DEFAULTS = { textSize: 1.0, theme: 'navy', reduceMotion: false, soundOn: true };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch (e) { return { ...DEFAULTS }; }
}

function persist(s) {
  try { localStorage.setItem(KEY, JSON.stringify({ textSize: s.textSize, theme: s.theme, reduceMotion: s.reduceMotion, soundOn: s.soundOn })); } catch (e) {}
}

const _initial = load();
import('../engine/themes').then(({ applyTheme, applyTextSize, applyReduceMotion }) => {
  applyTheme(_initial.theme);
  applyTextSize(_initial.textSize);
  applyReduceMotion(_initial.reduceMotion);
});

export const useSettingsStore = create((set, get) => ({
  ...load(),
  setTextSize: (textSize) => { set({ textSize }); applyTextSize(textSize); persist(get()); },
  setTheme: (theme) => { set({ theme }); applyTheme(theme); persist(get()); },
  toggleReduceMotion: () => { const v = !get().reduceMotion; set({ reduceMotion: v }); applyReduceMotion(v); persist(get()); },
  toggleSound: () => { set({ soundOn: !get().soundOn }); persist(get()); },
  applyAll: () => { const s = get(); applyTheme(s.theme); applyTextSize(s.textSize); applyReduceMotion(s.reduceMotion); },
  reset: () => { set({ ...DEFAULTS }); applyTheme(DEFAULTS.theme); applyTextSize(DEFAULTS.textSize); persist(get()); },
}));
