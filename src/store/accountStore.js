import { create } from 'zustand';

const STORAGE_KEY = '9jawonderpal.accounts.v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      parent: state.parent,
      children: state.children,
      activeChildId: state.activeChildId,
      onboarded: state.onboarded,
    }));
  } catch (e) {}
}

const initial = load();

export const useAccountStore = create((set, get) => ({
  parent: initial?.parent || null,
  children: initial?.children || [],
  activeChildId: initial?.activeChildId || null,
  onboarded: initial?.onboarded || false,

  createParent: (parent) => {
    const next = { ...get(), parent: { ...parent, id: 'parent-' + Date.now(), ts: Date.now() } };
    set({ parent: next.parent });
    save(get());
    return next.parent;
  },

  addChild: (child) => {
    const newChild = {
      id: 'child-' + Date.now(),
      name: child.name || 'Child',
      age: Number(child.age) || 7,
      gender: child.gender || 'unspecified',
      culture: child.culture || 'mixed',
      interests: child.interests || [],
      avatar: child.avatar || '🌟',
      createdAt: Date.now(),
    };
    const children = [...get().children, newChild];
    set({ children, activeChildId: get().activeChildId || newChild.id });
    save(get());
    return newChild;
  },

  updateChild: (id, patch) => {
    const children = get().children.map((c) => (c.id === id ? { ...c, ...patch } : c));
    set({ children });
    save(get());
  },

  deleteChild: (id) => {
    const children = get().children.filter((c) => c.id !== id);
    const activeChildId = get().activeChildId === id ? (children[0]?.id || null) : get().activeChildId;
    set({ children, activeChildId });
    save(get());
  },

  setActiveChild: (id) => {
    set({ activeChildId: id });
    save(get());
  },

  getActiveChild: () => {
    const state = get();
    return state.children.find((c) => c.id === state.activeChildId) || state.children[0] || null;
  },

  completeOnboarding: () => {
    set({ onboarded: true });
    save(get());
  },

  signOut: () => {
    set({ parent: null, children: [], activeChildId: null, onboarded: false });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },
}));
