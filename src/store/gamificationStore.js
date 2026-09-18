import { create } from 'zustand';
import { POINTS, evaluateBadges } from '../engine/badges';

const KEY = '9jawonderpal.game.v1';

function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function persist(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      points: s.points, streaks: s.streaks, earnedBadges: s.earnedBadges,
      modeCounts: s.modeCounts, homeworkCount: s.homeworkCount, activity: s.activity,
    }));
  } catch (e) {}
}

const init = load();

export const useGamificationStore = create((set, get) => ({
  points: init?.points || {},
  streaks: init?.streaks || {},
  earnedBadges: init?.earnedBadges || {},
  modeCounts: init?.modeCounts || {},
  homeworkCount: init?.homeworkCount || {},
  activity: init?.activity || {},

  recordPage: (childId, mode) => {
    if (!childId) return null;
    const s = get();
    const pts = POINTS[mode] || 10;
    const points = { ...s.points, [childId]: (s.points[childId] || 0) + pts };
    const modeCounts = {
      ...s.modeCounts,
      [childId]: { ...(s.modeCounts[childId] || {}), [mode]: ((s.modeCounts[childId] || {})[mode] || 0) + 1 },
    };
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastDay = (s.activity[childId] || {}).lastDay;
    const streak = s.streaks[childId] || 0;
    const newStreak = lastDay === today ? streak : (lastDay === yesterday ? streak + 1 : 1);
    const streaks = { ...s.streaks, [childId]: newStreak };
    const activity = { ...s.activity, [childId]: { ...(s.activity[childId] || {}), lastDay: today } };
    const totalPages = Object.values(modeCounts[childId] || {}).reduce((a, b) => a + b, 0);
    const earned = evaluateBadges({
      totalPages,
      modeCounts: modeCounts[childId] || {},
      homeworkCount: s.homeworkCount[childId] || 0,
      currentStreak: newStreak,
      totalPoints: points[childId] || 0,
    });
    const prevEarned = s.earnedBadges[childId] || [];
    const newlyEarned = earned.filter((k) => !prevEarned.includes(k));
    const earnedBadges = { ...s.earnedBadges, [childId]: earned };
    set({ points, modeCounts, streaks, activity, earnedBadges });
    persist(get());
    return { pointsEarned: pts, streak: newStreak, totalPoints: points[childId], newlyEarned };
  },

  recordHomework: (childId) => {
    if (!childId) return null;
    const s = get();
    set({ homeworkCount: { ...s.homeworkCount, [childId]: (s.homeworkCount[childId] || 0) + 1 } });
    return get().recordPage(childId, 'homework');
  },

  getChildStats: (childId) => {
    const s = get();
    return {
      points: s.points[childId] || 0,
      streak: s.streaks[childId] || 0,
      badges: s.earnedBadges[childId] || [],
      modeCounts: s.modeCounts[childId] || {},
      homeworkCount: s.homeworkCount[childId] || 0,
    };
  },
}));
