const AFRICAN_HINTS = [
  'african', 'nigerian', 'yoruba', 'igbo', 'hausa', 'lagos', 'nollywood',
  'ankara', 'adire', 'kente', 'gele', 'aso-oke', 'drum',
  'baobab', 'savanna', 'harmattan', 'calabash', 'sahel',
];

const ANIMALS = /lion|elephant|zebra|giraffe|cheetah|antelope|hyena|parrot|crocodile|hippo|monkey|gorilla|snake|tortoise|spider|leopard|rhino/i;
const SCENES = /village|market|palace|farm|river|forest|mountain|sunset|hut|compound|compound/i;

export function enrichQuery(prompt) {
  const lower = String(prompt || '').toLowerCase();
  if (AFRICAN_HINTS.some((h) => lower.includes(h))) return prompt;
  if (ANIMALS.test(lower)) return prompt + ' African savanna';
  if (SCENES.test(lower)) return prompt + ' Nigerian village';
  return prompt + ' West African';
}
