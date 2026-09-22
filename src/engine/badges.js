export const BADGES = [
  { key: 'first-story',      name: 'First Story',      emoji: '📖', desc: 'Made your very first page.',         threshold: 1,   type: 'pages' },
  { key: 'storyteller',      name: 'Storyteller',      emoji: '✍️', desc: 'Made 10 pages.',                     threshold: 10,  type: 'pages' },
  { key: 'author',           name: 'Author',           emoji: '📚', desc: 'Made 25 pages.',                     threshold: 25,  type: 'pages' },
  { key: 'folklore-keeper',  name: 'Folklore Keeper',  emoji: '📜', desc: 'Made 5 Folklore pages.',             threshold: 5,   type: 'mode-folklore' },
  { key: 'fact-finder',      name: 'Fact Finder',      emoji: '🧠', desc: 'Made 5 Fun Facts pages.',            threshold: 5,   type: 'mode-funfact' },
  { key: 'own-voice',        name: 'Own Voice',        emoji: '🎨', desc: 'Made 5 Make-Your-Own pages.',        threshold: 5,   type: 'mode-own' },
  { key: 'homework-hero',    name: 'Homework Hero',    emoji: '✏️', desc: 'Asked 5 homework questions.',        threshold: 5,   type: 'homework' },
  { key: 'streak-3',         name: 'Three Day Streak', emoji: '🔥', desc: 'Three days in a row.',               threshold: 3,   type: 'streak' },
  { key: 'streak-7',         name: 'Week Streak',      emoji: '⚡', desc: 'Seven days in a row.',               threshold: 7,   type: 'streak' },
  { key: 'streak-30',        name: 'Month Streak',     emoji: '🌟', desc: 'Thirty days in a row.',              threshold: 30,  type: 'streak' },
  { key: 'hundred-points',   name: 'Hundred Club',     emoji: '💯', desc: 'Earned 100 points.',                 threshold: 100, type: 'points' },
  { key: 'five-hundred',     name: 'Gold Mind',        emoji: '🏆', desc: 'Earned 500 points.',                 threshold: 500, type: 'points' },
];

export const POINTS = { story: 10, folklore: 15, funfact: 12, own: 18, homework: 20, game: 5 };

export const LEVELS = [
  { min: 0,   name: 'Seedling',      emoji: '🌱' },
  { min: 50,  name: 'Explorer',      emoji: '🧭' },
  { min: 150, name: 'Storyteller',   emoji: '📖' },
  { min: 300, name: 'Keeper',        emoji: '🏛️' },
  { min: 600, name: 'Wise One',      emoji: '🦉' },
  { min: 1000, name: 'Legend',       emoji: '⭐' },
];

export function levelFor(points) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) current = l;
  return current;
}

export function evaluateBadges(stats) {
  const earned = [];
  for (const b of BADGES) {
    let value = 0;
    switch (b.type) {
      case 'pages': value = stats.totalPages || 0; break;
      case 'mode-folklore': value = (stats.modeCounts || {}).folklore || 0; break;
      case 'mode-funfact':  value = (stats.modeCounts || {}).funfact  || 0; break;
      case 'mode-own':      value = (stats.modeCounts || {}).own      || 0; break;
      case 'homework': value = stats.homeworkCount || 0; break;
      case 'streak':   value = stats.currentStreak || 0; break;
      case 'points':   value = stats.totalPoints || 0;   break;
    }
    if (value >= b.threshold) earned.push(b.key);
  }
  return earned;
}

export function badgeByKey(key) { return BADGES.find((b) => b.key === key); }
