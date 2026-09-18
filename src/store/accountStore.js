import { create } from 'zustand';

const STORAGE_KEY = '9jawonderpal.accounts.v2';

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
      childSession: state.childSession,
    }));
  } catch (e) {}
}

const initial = load();

function makeLogin(name) {
  const base = String(name || 'child').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'child';
  return base + Math.floor(100 + Math.random() * 900);
}

function makePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const useAccountStore = create((set, get) => ({
  parent: initial?.parent || null,
  children: initial?.children || [],
  activeChildId: initial?.activeChildId || null,
  onboarded: initial?.onboarded || false,
  childSession: initial?.childSession || null,   // { childId, ts } when a child is signed in

  /* ── Parent ── */
  createParent: (parent) => {
    set({ parent: { ...parent, id: 'parent-' + Date.now(), ts: Date.now() } });
    save(get());
  },
  signOut: () => {
    set({ parent: null, children: [], activeChildId: null, onboarded: false, childSession: null });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },

  /* ── Children ── */
  addChild: (child) => {
    const login = child.login || makeLogin(child.name);
    const pin = child.pin || makePin();
    const newChild = {
      id: 'child-' + Date.now(),
      name: child.name || 'Child',
      age: Number(child.age) || 7,
      gender: child.gender || 'unspecified',
      culture: child.culture || 'mixed',
      avatar: child.avatar || '🌟',
      login,
      pin,
      interests: child.interests || [],
      enabledSubjects: child.enabledSubjects || ['english', 'maths', 'basic_science', 'history', 'cca', 'nigerian_language'],
      allowedModes: child.allowedModes || ['story', 'folklore', 'funfact', 'own', 'homework'],
      createdAt: Date.now(),
    };
    const children = [...get().children, newChild];
    set({ children, activeChildId: get().activeChildId || newChild.id });
    save(get());
    return newChild;
  },

  updateChild: (id, patch) => {
    set({ children: get().children.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
    save(get());
  },

  deleteChild: (id) => {
    const children = get().children.filter((c) => c.id !== id);
    set({ children, activeChildId: get().activeChildId === id ? (children[0]?.id || null) : get().activeChildId });
    save(get());
  },

  setActiveChild: (id) => { set({ activeChildId: id }); save(get()); },
  getActiveChild: () => {
    const s = get();
    return s.children.find((c) => c.id === s.activeChildId) || s.children[0] || null;
  },

  /* ── Child sign-in ── */
  childLogin: (login, pin) => {
    const child = get().children.find((c) => c.login === login && c.pin === pin);
    if (!child) return null;
    set({ childSession: { childId: child.id, ts: Date.now() }, activeChildId: child.id });
    save(get());
    return child;
  },
  childSignOut: () => { set({ childSession: null }); save(get()); },
  getChildSession: () => {
    const s = get();
    if (!s.childSession) return null;
    return s.children.find((c) => c.id === s.childSession.childId) || null;
  },

  /* ── Parent content controls ── */
  toggleSubject: (childId, subjectKey) => {
    const child = get().children.find((c) => c.id === childId);
    if (!child) return;
    const has = (child.enabledSubjects || []).includes(subjectKey);
    const enabled = has
      ? child.enabledSubjects.filter((k) => k !== subjectKey)
      : [...(child.enabledSubjects || []), subjectKey];
    get().updateChild(childId, { enabledSubjects: enabled });
  },
  toggleMode: (childId, modeKey) => {
    const child = get().children.find((c) => c.id === childId);
    if (!child) return;
    const has = (child.allowedModes || []).includes(modeKey);
    const allowed = has
      ? child.allowedModes.filter((k) => k !== modeKey)
      : [...(child.allowedModes || []), modeKey];
    get().updateChild(childId, { allowedModes: allowed });
  },
  regenerateCredentials: (childId) => {
    const child = get().children.find((c) => c.id === childId);
    if (!child) return null;
    const login = makeLogin(child.name);
    const pin = makePin();
    get().updateChild(childId, { login, pin });
    return { login, pin };
  },

  completeOnboarding: () => { set({ onboarded: true }); save(get()); },
}));
