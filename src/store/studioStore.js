import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const MAX_EVENTS = 60;
const WORLD_STORAGE_KEY = 'wonderpal.worlds';

function loadWorlds() {
  try {
    const raw = localStorage.getItem(WORLD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function saveWorlds(worlds) {
  try { localStorage.setItem(WORLD_STORAGE_KEY, JSON.stringify(worlds.slice(0, 30))); } catch (e) {}
}

export const useStudioStore = create((set, get) => ({
  /* Mode: 'parent' (technical, node graph) or 'child' (big mic, big world) */
  mode: 'child',
  setMode: (mode) => set({ mode }),

  /* Onboarding */
  onboardingDone: (() => { try { return localStorage.getItem('wonderpal.onboarded') === '1'; } catch (e) { return false; } })(),
  completeOnboarding: () => {
    try { localStorage.setItem('wonderpal.onboarded', '1'); } catch (e) {}
    set({ onboardingDone: true });
  },

  /* Node graph (parent mode only) */
  nodes: [],
  edges: [],
  onNodesChange: (c) => set({ nodes: applyNodeChanges(c, get().nodes) }),
  onEdgesChange: (c) => set({ edges: applyEdgeChanges(c, get().edges) }),
  onConnect: (c) => set({ edges: addEdge({ ...c, animated: true }, get().edges) }),
  addNode: (node) => set((s) => (s.nodes.find((n) => n.id === node.id) ? s : { nodes: [...s.nodes, node] })),
  patchNodeData: (id, patch) =>
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) })),

  /* Scene */
  sceneObjects: [],
  sceneHistory: [],
  patchSceneObject: (id, patch) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  deleteSceneObject: (id) =>
    set((s) => ({ sceneObjects: s.sceneObjects.filter((o) => o.id !== id) })),
  upsertSceneObject: (obj) =>
    set((s) => {
      const i = s.sceneObjects.findIndex((o) => o.id === obj.id);
      if (i === -1) return { sceneObjects: [...s.sceneObjects, obj] };
      const next = [...s.sceneObjects];
      next[i] = { ...next[i], ...obj };
      return { sceneObjects: next };
    }),
  addToHistory: (text) => set((s) => ({ sceneHistory: [...s.sceneHistory, text] })),
  clearScene: () => set({ sceneObjects: [], sceneHistory: [], lastRender: null }),
  resetSceneHistory: () => set({ sceneHistory: [] }),

  /* Stream status */
  streamStatus: 'idle',
  setStreamStatus: (streamStatus) => set({ streamStatus }),
  phase: 'idle',
  setPhase: (phase) => set({ phase }),

  /* Prompt */
  promptInput: '',
  setPromptInput: (promptInput) => set({ promptInput }),

  /* Companion */
  companion: { visible: false, text: '', streaming: false },
  companionStart: () => set({ companion: { visible: true, text: '', streaming: false } }),
  companionToken: (delta) =>
    set((s) => ({ companion: { ...s.companion, visible: true, streaming: true, text: s.companion.text + delta } })),
  companionDone: (text) =>
    set((s) => ({ companion: { visible: true, streaming: false, text: text || s.companion.text } })),
  companionDismiss: () => set((s) => ({ companion: { ...s.companion, visible: false } })),

  /* Voice */
  pages: [],
  stickers: [],
  addSticker: (emoji) => set((s) => ({ stickers: [...s.stickers, { emoji, ts: Date.now() }] })),
  clearStickers: () => set({ stickers: [] }),
  addPage: (page) => set((s) => ({ pages: [...s.pages, page] })),
  saveCurrentBook: () => {
    const state = get();
    if (!state.pages.length) return null;
    const first = state.pages[0];
    const book = {
      id: 'book-' + Date.now(),
      ts: Date.now(),
      preview: first.image || null,
      promptSummary: state.pages.map((p) => p.title).join(' · ').slice(0, 120) || 'A new book',
      pages: state.pages.map((p) => ({ ...p })),
      stickerCount: state.pages.length,
    };
    const next = [book, ...state.worlds].slice(0, 30);
    try { localStorage.setItem('9jawonderpal.books', JSON.stringify(next)); } catch (e) {}
    set({ worlds: next });
    return book;
  },
  loadBook: (id) => {
    const book = get().worlds.find((w) => w.id === id);
    if (!book) return null;
    set({ pages: book.pages || [] });
    return book;
  },
  attachVideoToBook: (bookId, videoUrl) => {
    const next = get().worlds.map((w) => w.id === bookId ? { ...w, videoUrl } : w);
    try { localStorage.setItem('9jawonderpal.books', JSON.stringify(next)); } catch (e) {}
    set({ worlds: next });
  },
  updatePage: (id, patch) => set((s) => ({ pages: s.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  deletePage: (id) => set((s) => ({ pages: s.pages.filter((p) => p.id !== id) })),
  clearPages: () => set({ pages: [] }),
  voiceMuted: false,
  toggleVoiceMuted: () => set((s) => ({ voiceMuted: !s.voiceMuted })),

  /* Last render */
  lastRender: null,

  /* Mood palette */
  mood: { primary: '#00f0ff', accent: '#3b82f6', bg: '#070b14', fog: '#070b14' },
  setMood: (mood) => set((s) => ({ mood: { ...s.mood, ...mood } })),

  /* Worlds gallery */
  worlds: loadWorlds(),
  saveCurrentWorld: (preview, promptSummary) => {
    const state = get();
    if (!state.sceneObjects.length) return null;
    const world = {
      id: 'world-' + Date.now(),
      ts: Date.now(),
      preview,
      promptSummary: promptSummary || state.sceneHistory.join(' → ') || 'A new world',
      objects: state.sceneObjects.map((o) => ({ id: o.id, kind: o.kind, color: o.color, modelUrl: o.modelUrl || null })),
      history: [...state.sceneHistory],
      mood: { ...state.mood },
    };
    const next = [world, ...state.worlds].slice(0, 30);
    saveWorlds(next);
    set({ worlds: next });
    return world;
  },
  loadWorld: (id) => {
    const world = get().worlds.find((w) => w.id === id);
    if (!world) return null;
    set({
      sceneObjects: world.objects,
      sceneHistory: world.history || [],
      lastRender: world.preview ? { preview: world.preview } : null,
      mood: world.mood || get().mood,
    });
    return world;
  },
  deleteWorld: (id) => {
    const next = get().worlds.filter((w) => w.id !== id);
    saveWorlds(next);
    set({ worlds: next });
  },

  /* Events (debug log) */
  events: [],
  pushEvent: (evt) => set((s) => ({ events: [evt, ...s.events].slice(0, MAX_EVENTS) })),
}));
