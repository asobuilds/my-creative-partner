/**
 * Tracks which guides a child has already seen.
 * Stored per child ID in localStorage.
 * Guides show once, then stay hidden.
 */

const KEY = '9jawonderpal.guides.seen.v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}

/** Check if a guide has already been seen for this child. */
export function hasSeenGuide(childId, guideKey) {
  if (!childId) return false;
  const data = load();
  return Boolean(data[childId] && data[childId][guideKey]);
}

/** Mark a guide as seen. */
export function markGuideSeen(childId, guideKey) {
  if (!childId) return;
  const data = load();
  data[childId] = data[childId] || {};
  data[childId][guideKey] = Date.now();
  save(data);
}

/** Reset all guides for a child (parent use). */
export function resetGuides(childId) {
  if (!childId) return;
  const data = load();
  delete data[childId];
  save(data);
}

/* ── Scripted guide messages ─────────────────────────────── */

export const GUIDES = {
  'first-visit-create': {
    mascot: 'ijapa',
    position: 'bottom-right',
    message: "Hi! I'm Ìjàpá. Tap the microphone and tell me what you want to make. Say a lion, a drum, or your own idea!",
  },
  'first-visit-games': {
    mascot: 'star',
    position: 'bottom-right',
    message: "Welcome to the games! Pick any one to start. Each game has 5 stages — can you beat them all?",
  },
  'first-visit-wordmatch': {
    mascot: 'ijapa',
    position: 'bottom-right',
    message: "Tap the Nigerian word that matches the picture. Get 2 right in a row for a COMBO!",
  },
  'first-visit-shapesort': {
    mascot: 'star',
    position: 'bottom-right',
    message: "Drag each shape into its matching slot. Take your time — there's no rush!",
  },
  'first-visit-memorymatch': {
    mascot: 'ijapa',
    position: 'bottom-right',
    message: "Tap two cards. If they match, they stay open! Find all the pairs to win.",
  },
  'first-visit-storyorder': {
    mascot: 'drum',
    position: 'bottom-right',
    message: "Tap the sentences in the order they should happen. You can undo by tapping again!",
  },
  'first-visit-proverb': {
    mascot: 'ijapa',
    position: 'bottom-right',
    message: "Read the proverb — then tap what it means. Wisdom comes from listening!",
  },
  'first-visit-homework': {
    mascot: 'ijapa',
    position: 'bottom-right',
    message: "Tell me a school question. I'll explain it step by step so you understand — not just the answer.",
  },
  'first-visit-book': {
    mascot: 'star',
    position: 'bottom-right',
    message: "Every page you make becomes part of your book. Tap Ask ✨ to learn even more about any topic!",
  },
  'first-visit-spark': {
    mascot: 'drum',
    position: 'bottom-right',
    message: "Need a spark? Tap any idea you like. I'll turn it into a story you can play with!",
  },
};
