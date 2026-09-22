import { create } from 'zustand';

const KEY = '9jawonderpal.gameprogress.v2';
const EMPTY_PROGRESS = Object.freeze({ stage: 1, highScore: 0, totalPlays: 0, lastPlayed: 0 });

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function persist(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
}

const initial = load();

export const useGameProgressStore = create((set, get) => ({
  progress: initial?.progress || {},
  combos: initial?.combos || {},

  // Return the EXISTING object reference if it exists, else the frozen EMPTY_PROGRESS
  getGameProgress: (childId, gameKey) => {
    if (!childId || !gameKey) return EMPTY_PROGRESS;
    const s = get();
    const child = s.progress[childId];
    if (!child) return EMPTY_PROGRESS;
    return child[gameKey] || EMPTY_PROGRESS;
  },

  getCombo: (childId, gameKey) => {
    if (!childId || !gameKey) return 0;
    const s = get();
    const child = s.combos[childId];
    return (child && child[gameKey]) || 0;
  },

  recordResult: (childId, gameKey, { correct, pointsBase }) => {
    if (!childId || !gameKey) return { combo: 0, multiplier: 1, earned: 0, correct: false };
    const s = get();
    const prevCombo = s.getCombo(childId, gameKey);
    const combo = correct ? prevCombo + 1 : 0;
    const multiplier = correct ? 1 + Math.min(combo - 1, 9) * 0.5 : 1;
    const earned = Math.round((pointsBase || 5) * multiplier);

    // Only touch state when there is actual change
    const nextCombos = { ...s.combos, [childId]: { ...(s.combos[childId] || {}), [gameKey]: combo } };
    set({ combos: nextCombos });
    persist(get());

    return { combo, multiplier, earned, correct };
  },

  completeStage: (childId, gameKey, { finalScore, stage }) => {
    if (!childId || !gameKey) return;
    const s = get();
    const prevProg = s.getGameProgress(childId, gameKey);
    // Skip if stage unchanged
    if (prevProg.stage > stage || (prevProg.highScore >= finalScore && prevProg.stage === stage + 1)) {
      return;
    }
    const nextProg = {
      stage: Math.max(prevProg.stage || 1, (stage || 1) + 1),
      highScore: Math.max(prevProg.highScore || 0, finalScore || 0),
      totalPlays: (prevProg.totalPlays || 0) + 1,
      lastPlayed: Date.now(),
    };
    const nextProgress = { ...s.progress, [childId]: { ...(s.progress[childId] || {}), [gameKey]: nextProg } };
    set({ progress: nextProgress });
    persist(get());
  },

  resetGame: (childId, gameKey) => {
    const s = get();
    const nextProgress = { ...s.progress };
    if (nextProgress[childId]) {
      nextProgress[childId] = { ...nextProgress[childId], [gameKey]: { stage: 1, highScore: 0, totalPlays: 0, lastPlayed: 0 } };
    }
    set({ progress: nextProgress });
    persist(get());
  },
}));
