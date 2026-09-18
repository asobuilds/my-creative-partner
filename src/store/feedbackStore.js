import { create } from 'zustand';

const KEY = '9jawonderpal.feedback.v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function persist(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(-50))); } catch (e) {}
}

export const useFeedbackStore = create((set, get) => ({
  items: load(),
  submit: (text, meta) => {
    const clean = String(text || '').trim();
    if (!clean) return null;
    const item = { id: 'fb-' + Date.now(), text: clean, ts: Date.now(), source: (meta && meta.source) || 'unknown' };
    const next = [...get().items, item];
    persist(next);
    set({ items: next });
    return item;
  },
  clear: () => { persist([]); set({ items: [] }); },
}));
