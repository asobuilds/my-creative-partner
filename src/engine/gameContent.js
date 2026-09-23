/**
 * Culture-aware game content.
 * Each culture gets its own word set. If a culture lacks a word,
 * we FALL BACK to English — never to another Nigerian language.
 */

export const WORDS_BY_CULTURE = {
  yoruba: [
    { word: 'Kìnìún', meaning: 'Lion', emoji: '🦁' },
    { word: 'Erin', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ìjàpá', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Idì', meaning: 'Eagle', emoji: '🦅' },
    { word: 'Ẹja', meaning: 'Fish', emoji: '🐟' },
    { word: 'Ọ̀pọ̀lọ́', meaning: 'Frog', emoji: '🐸' },
    { word: 'Òṣùpá', meaning: 'Moon', emoji: '🌙' },
    { word: 'Odò', meaning: 'River', emoji: '🌊' },
    { word: 'Igi', meaning: 'Tree', emoji: '🌳' },
    { word: 'Iná', meaning: 'Fire', emoji: '🔥' },
    { word: 'Ilé', meaning: 'House', emoji: '🏠' },
    { word: 'Oúnjẹ', meaning: 'Food', emoji: '🍲' },
  ],
  igbo: [
    { word: 'Ọdụm', meaning: 'Lion', emoji: '🦁' },
    { word: 'Enyi', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Mbe', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Ugo', meaning: 'Eagle', emoji: '🦅' },
    { word: 'Azụ', meaning: 'Fish', emoji: '🐟' },
    { word: 'Ọnwa', meaning: 'Moon', emoji: '🌙' },
    { word: 'Osimiri', meaning: 'River', emoji: '🌊' },
    { word: 'Osisi', meaning: 'Tree', emoji: '🌳' },
    { word: 'Ọkụ', meaning: 'Fire', emoji: '🔥' },
    { word: 'Nwa', meaning: 'Child', emoji: '🧒' },
    { word: 'Ụlọ', meaning: 'House', emoji: '🏠' },
    { word: 'Nri', meaning: 'Food', emoji: '🍲' },
  ],
  hausa: [
    { word: 'Zaki', meaning: 'Lion', emoji: '🦁' },
    { word: 'Giwa', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Kunkuru', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Gaggafa', meaning: 'Eagle', emoji: '🦅' },
    { word: 'Kifi', meaning: 'Fish', emoji: '🐟' },
    { word: 'Wata', meaning: 'Moon', emoji: '🌙' },
    { word: 'Kogi', meaning: 'River', emoji: '🌊' },
    { word: 'Itaci', meaning: 'Tree', emoji: '🌳' },
    { word: 'Wuta', meaning: 'Fire', emoji: '🔥' },
    { word: 'Ruwa', meaning: 'Water', emoji: '💧' },
    { word: 'Gida', meaning: 'House', emoji: '🏠' },
    { word: 'Abinci', meaning: 'Food', emoji: '🍲' },
  ],
  idoma: [
    { word: 'Aje', meaning: 'Lion', emoji: '🦁' },
    { word: 'Enyi', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ikpala', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Uchẹ', meaning: 'Bird', emoji: '🐦' },
    { word: 'Ẹja', meaning: 'Fish', emoji: '🐟' },
    { word: 'Ochu', meaning: 'Moon', emoji: '🌙' },
    { word: 'Onyi', meaning: 'River', emoji: '🌊' },
    { word: 'Okpo', meaning: 'Tree', emoji: '🌳' },
    { word: 'Ina', meaning: 'Fire', emoji: '🔥' },
    { word: 'Omi', meaning: 'Water', emoji: '💧' },
    { word: 'Ije', meaning: 'House', emoji: '🏠' },
    { word: 'Onya', meaning: 'Food', emoji: '🍲' },
  ],
  tiv: [
    { word: 'Ikyav', meaning: 'Lion', emoji: '🦁' },
    { word: 'Ihwa', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Agbenda', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Iyon', meaning: 'Bird', emoji: '🐦' },
    { word: 'Kera', meaning: 'Moon', emoji: '🌙' },
    { word: 'Aya', meaning: 'River', emoji: '🌊' },
    { word: 'Uwegh', meaning: 'Tree', emoji: '🌳' },
    { word: 'Wan', meaning: 'Fire', emoji: '🔥' },
    { word: 'Mkur', meaning: 'Water', emoji: '💧' },
    { word: 'Ya', meaning: 'House', emoji: '🏠' },
  ],
  efik: [
    { word: 'Ekpe', meaning: 'Lion', emoji: '🦁' },
    { word: 'Enyen', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ikut', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Efere', meaning: 'Bird', emoji: '🐦' },
    { word: 'Ekom', meaning: 'Moon', emoji: '🌙' },
    { word: 'Akpa', meaning: 'River', emoji: '🌊' },
    { word: 'Eto', meaning: 'Tree', emoji: '🌳' },
  ],
  ibibio: [
    { word: 'Ekpe', meaning: 'Lion', emoji: '🦁' },
    { word: 'Enyen', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ikut', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Efere', meaning: 'Bird', emoji: '🐦' },
    { word: 'Ekom', meaning: 'Moon', emoji: '🌙' },
    { word: 'Akpa', meaning: 'River', emoji: '🌊' },
    { word: 'Eto', meaning: 'Tree', emoji: '🌳' },
  ],
  ijaw: [
    { word: 'Biri', meaning: 'Lion', emoji: '🦁' },
    { word: 'Enyi', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ikputu', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Ekun', meaning: 'Bird', emoji: '🐦' },
    { word: 'Opu', meaning: 'Moon', emoji: '🌙' },
    { word: 'Oru', meaning: 'River', emoji: '🌊' },
    { word: 'Pere', meaning: 'Tree', emoji: '🌳' },
  ],
  edo: [
    { word: 'Oduma', meaning: 'Lion', emoji: '🦁' },
    { word: 'Eni', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ika', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Ahianmwen', meaning: 'Bird', emoji: '🐦' },
    { word: 'Oki', meaning: 'Moon', emoji: '🌙' },
    { word: 'Ẹdẹ', meaning: 'River', emoji: '🌊' },
    { word: 'Aranmwen', meaning: 'Tree', emoji: '🌳' },
  ],
  fulfulde: [
    { word: 'Baali', meaning: 'Lion', emoji: '🦁' },
    { word: 'Nyiiwa', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Kokoba', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Pooli', meaning: 'Bird', emoji: '🐦' },
    { word: 'Lewru', meaning: 'Moon', emoji: '🌙' },
    { word: 'Maayo', meaning: 'River', emoji: '🌊' },
    { word: 'Lekki', meaning: 'Tree', emoji: '🌳' },
  ],
  kanuri: [
    { word: 'Kura', meaning: 'Lion', emoji: '🦁' },
    { word: 'Kamu', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Ngəwur', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Ndəro', meaning: 'Bird', emoji: '🐦' },
    { word: 'Kǝngal', meaning: 'Moon', emoji: '🌙' },
    { word: 'Ngǝnne', meaning: 'River', emoji: '🌊' },
    { word: 'Kǝrka', meaning: 'Tree', emoji: '🌳' },
  ],
  // English fallback for Mixed and any culture missing a word
  default: [
    { word: 'Lion', meaning: 'Lion', emoji: '🦁' },
    { word: 'Elephant', meaning: 'Elephant', emoji: '🐘' },
    { word: 'Tortoise', meaning: 'Tortoise', emoji: '🐢' },
    { word: 'Eagle', meaning: 'Eagle', emoji: '🦅' },
    { word: 'Fish', meaning: 'Fish', emoji: '🐟' },
    { word: 'Moon', meaning: 'Moon', emoji: '🌙' },
    { word: 'River', meaning: 'River', emoji: '🌊' },
    { word: 'Tree', meaning: 'Tree', emoji: '🌳' },
    { word: 'Fire', meaning: 'Fire', emoji: '🔥' },
    { word: 'Water', meaning: 'Water', emoji: '💧' },
    { word: 'House', meaning: 'House', emoji: '🏠' },
    { word: 'Food', meaning: 'Food', emoji: '🍲' },
  ],
};

/**
 * CRITICAL: If a culture lacks a word set, return ENGLISH — never another culture.
 */
export function wordsForCulture(culture) {
  const key = String(culture || '').toLowerCase();
  return WORDS_BY_CULTURE[key] || WORDS_BY_CULTURE.default;
}

export const STAGE_PRESETS = {
  word: {
    1: { options: 3, rounds: 5, basePoints: 10 },
    2: { options: 3, rounds: 6, basePoints: 12 },
    3: { options: 4, rounds: 6, basePoints: 14 },
    4: { options: 4, rounds: 7, basePoints: 16 },
    5: { options: 4, rounds: 8, basePoints: 20 },
  },
  shape: {
    1: { shapes: 3, pieces: 3, basePoints: 8 },
    2: { shapes: 4, pieces: 4, basePoints: 10 },
    3: { shapes: 4, pieces: 6, basePoints: 12 },
    4: { shapes: 5, pieces: 6, basePoints: 14 },
    5: { shapes: 6, pieces: 8, basePoints: 16 },
  },
  proverb: {
    1: { options: 2, rounds: 4, basePoints: 10 },
    2: { options: 3, rounds: 5, basePoints: 12 },
    3: { options: 3, rounds: 6, basePoints: 14 },
  },
};

export const PROVERBS_BY_CULTURE = {
  yoruba: [
    { text: 'Ìjàpá kì í gbọ́n lójú ọ̀gá', meaning: 'The tortoise is never wise in front of the master.' },
    { text: 'Bí a bá ní kùn, a kì í ṣe ọ̀run', meaning: 'If we have a lion, we do not fear the sun.' },
    { text: 'Ilé làbọ̀ sinmi oko', meaning: 'Home is where we rest after the journey.' },
    { text: 'Ọ̀rọ̀ tó bá dùn, ojú ẹni là á wò', meaning: 'A sweet word looks to the eye.' },
    { text: 'À ń fi ojú ẹni hàn ẹni', meaning: 'We see through one another.' },
  ],
  igbo: [
    { text: 'Igbo kwenu', meaning: 'The strength of the community is the strength of each person.' },
    { text: 'Ọ dị mma', meaning: 'It is good.' },
    { text: 'Ihe kwuru, ihe akwudebe ya', meaning: 'When something stands, something else stands beside it.' },
  ],
  hausa: [
    { text: 'Komai nisan jifa, kasa zai dawo', meaning: 'However far a stone is thrown, it falls to the ground.' },
    { text: 'Sannu ba ta hana zumunta', meaning: 'Politeness does not hinder friendship.' },
  ],
  idoma: [
    { text: 'Onye wu owo, o wu inya', meaning: 'The hand that gives is the hand that is blessed.' },
    { text: 'Ukwu n egwu, o na-eso ya n isi', meaning: 'Where the leg dances, the head follows.' },
    { text: 'Onye nyere mmiri, o nyere ndu', meaning: 'Whoever gives water gives life.' },
  ],
  tiv: [
    { text: 'Kwagh-hir kera a mngeren', meaning: 'The story is the eye of the child.' },
    { text: 'Ya na kwagh u iyol', meaning: 'Family is greater than any one person.' },
  ],
  efik: [
    { text: 'Enyen emana edi', meaning: 'The visitor is like a king.' },
    { text: 'Mmesiere owo', meaning: 'Greetings bring people together.' },
  ],
  ibibio: [
    { text: 'Enyen emana edi', meaning: 'The visitor is like a king.' },
  ],
  ijaw: [
    { text: 'Ogu ịwụ mịnị, ogu mịnị', meaning: 'The water is the source of all things.' },
  ],
  edo: [
    { text: 'Ọmọ ọba ọ ma gbọn ẹ̀fẹ̀', meaning: 'The child of the king does not lose their way home.' },
  ],
  fulfulde: [
    { text: 'Man yetti, tana gani', meaning: 'Patience eats whatever is set before it.' },
  ],
  kanuri: [
    { text: 'Kǝla kǝla kamburo', meaning: 'Step by step reaches the journey.' },
  ],
  default: [
    { text: 'One tree does not make a forest', meaning: 'Many together make strength.' },
    { text: 'The river never forgets its source', meaning: 'We remember where we come from.' },
    { text: 'A child who asks questions learns', meaning: 'Curiosity is wisdom.' },
  ],
};

export function proverbsForCulture(culture) {
  const key = String(culture || '').toLowerCase();
  return PROVERBS_BY_CULTURE[key] || PROVERBS_BY_CULTURE.default;
}
