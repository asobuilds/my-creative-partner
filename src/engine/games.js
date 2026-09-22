export const GAMES = [
  { key: 'word-match', name: 'Word Match', emoji: '🔤', desc: 'Match the picture to the right Nigerian word.', color: '#ffb700', ageMin: 4, ageMax: 12, skill: 'language' },
  { key: 'shape-sort', name: 'Shape Sort', emoji: '🟦', desc: 'Drag each shape to its matching outline.', color: '#22d3ee', ageMin: 4, ageMax: 8, skill: 'maths' },
  { key: 'proverb-match', name: 'Proverb Match', emoji: '📜', desc: 'Match each proverb to its meaning.', color: '#a78bfa', ageMin: 7, ageMax: 12, skill: 'culture' },
  { key: 'story-order', name: 'Story Order', emoji: '📖', desc: 'Put the story pages back in the right order.', color: '#f472b6', ageMin: 6, ageMax: 12, skill: 'reading' },
];

export function gamesForAge(age) {
  const a = Number(age) || 7;
  return GAMES.filter((g) => a >= g.ageMin && a <= g.ageMax);
}

export function gameByKey(key) {
  return GAMES.find((g) => g.key === key);
}
