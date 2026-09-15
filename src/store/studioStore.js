import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const MAX_EVENTS = 60;

export const useStudioStore = create((set, get) => ({
  /* ─────────── Node Graph ─────────── */
  nodes: [],
  edges: [],
  onNodesChange: (c) => set({ nodes: applyNodeChanges(c, get().nodes) }),
  onEdgesChange: (c) => set({ edges: applyEdgeChanges(c, get().edges) }),
  onConnect: (c) => set({ edges: addEdge({ ...c, animated: true }, get().edges) }),
  setGraph: (nodes, edges) => set({ nodes, edges }),

  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  /** Patch a node's `data` in place — used by streaming token deltas. */
  patchNodeData: (id, patch) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      ),
    }),

  /* ─────────── 3D Scene ─────────── */
  sceneObjects: [],
  upsertSceneObject: (obj) =>
    set((s) => {
      const i = s.sceneObjects.findIndex((o) => o.id === obj.id);
      if (i === -1) return { sceneObjects: [...s.sceneObjects, obj] };
      const next = [...s.sceneObjects];
      next[i] = { ...next[i], ...obj };
      return { sceneObjects: next };
    }),
  clearScene: () => set({ sceneObjects: [] }),

  /* ─────────── Runtime / UX ─────────── */
  streamStatus: 'idle', // idle | connecting | open | retrying | closed
  setStreamStatus: (streamStatus) => set({ streamStatus }),

  activeNodeId: null,
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),

  events: [],
  pushEvent: (evt) => set((s) => ({ events: [evt, ...s.events].slice(0, MAX_EVENTS) })),

  /* ─────────── HUD / Prompt ─────────── */
  promptInput: '',
  setPromptInput: (promptInput) => set({ promptInput }),
}));