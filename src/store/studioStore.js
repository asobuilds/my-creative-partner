import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const MAX_EVENTS = 60;

export const useStudioStore = create((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (c) => set({ nodes: applyNodeChanges(c, get().nodes) }),
  onEdgesChange: (c) => set({ edges: applyEdgeChanges(c, get().edges) }),
  onConnect: (c) => set({ edges: addEdge({ ...c, animated: true }, get().edges) }),
  setGraph: (nodes, edges) => set({ nodes, edges }),
  addNode: (node) => set((s) => (s.nodes.find((n) => n.id === node.id) ? s : { nodes: [...s.nodes, node] })),
  patchNodeData: (id, patch) =>
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) })),

  sceneObjects: [],
  sceneHistory: [],
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
  replaceSceneObject: (obj) => set({ sceneObjects: [obj] }),

  streamStatus: 'idle',
  setStreamStatus: (streamStatus) => set({ streamStatus }),
  phase: 'idle',
  setPhase: (phase) => set({ phase }),

  activeNodeId: null,
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),

  events: [],
  pushEvent: (evt) => set((s) => ({ events: [evt, ...s.events].slice(0, MAX_EVENTS) })),

  promptInput: '',
  setPromptInput: (promptInput) => set({ promptInput }),

  companion: { visible: false, text: '', streaming: false },
  companionStart: () => set({ companion: { visible: true, text: '', streaming: false } }),
  companionToken: (delta) =>
    set((s) => ({ companion: { ...s.companion, visible: true, streaming: true, text: s.companion.text + delta } })),
  companionDone: (text) =>
    set((s) => ({ companion: { visible: true, streaming: false, text: text || s.companion.text } })),
  companionDismiss: () => set((s) => ({ companion: { ...s.companion, visible: false } })),

  voiceMuted: false,
  toggleVoiceMuted: () => set((s) => ({ voiceMuted: !s.voiceMuted })),

  lastRender: null,

  mood: { primary: '#00f0ff', accent: '#3b82f6', bg: '#070b14', fog: '#070b14' },
  setMood: (mood) => set((s) => ({ mood: { ...s.mood, ...mood } })),
}));
