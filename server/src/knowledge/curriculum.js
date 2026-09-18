/**
 * Nigerian Basic Education Curriculum — from NERDC 2025 revised.
 * Primary 1-6 subjects. Used for homework-help grounding and parent controls.
 */

export const PRIMARY_1_3 = [
  { key: 'english', name: 'English Studies', emoji: '📖', description: 'Reading, writing, speaking, phonics.' },
  { key: 'maths', name: 'Mathematics', emoji: '🔢', description: 'Numbers, shapes, patterns, simple arithmetic.' },
  { key: 'nigerian_language', name: 'Nigerian Language', emoji: '🗣️', description: 'Yoruba, Igbo, Hausa, Idoma, Tiv, Efik, or a language you choose.' },
  { key: 'basic_science', name: 'Basic Science', emoji: '🔬', description: 'Living things, weather, simple experiments.' },
  { key: 'phe', name: 'Physical & Health Education', emoji: '🏃', description: 'Body, exercise, hygiene, games.' },
  { key: 'crs', name: 'Christian Religious Studies', emoji: '✝️', description: 'Bible stories and values.' },
  { key: 'is', name: 'Islamic Studies', emoji: '☪️', description: 'Quranic stories and values.' },
  { key: 'history', name: 'Nigerian History', emoji: '🏛️', description: 'Heroes, kingdoms, traditions, and how Nigeria began.' },
  { key: 'social', name: 'Social & Citizenship Studies', emoji: '🌍', description: 'Family, community, Nigeria, rights, and duties.' },
  { key: 'cca', name: 'Cultural & Creative Arts', emoji: '🎨', description: 'Drawing, singing, dancing, drumming, folk art.' },
];

export const PRIMARY_4_6_EXTRA = [
  { key: 'tech', name: 'Basic Science & Technology', emoji: '⚙️', description: 'Simple machines, materials, tech in daily life.' },
  { key: 'digital', name: 'Basic Digital Literacy', emoji: '💻', description: 'Using computers, staying safe online.' },
  { key: 'prevoc', name: 'Pre-Vocational Studies', emoji: '🛠️', description: 'Farming, home management, crafts.' },
];

export function subjectsForAge(age) {
  const a = Number(age) || 7;
  if (a <= 8) return PRIMARY_1_3;
  return [...PRIMARY_1_3, ...PRIMARY_4_6_EXTRA];
}

export function getSubject(key) {
  const all = [...PRIMARY_1_3, ...PRIMARY_4_6_EXTRA];
  return all.find((s) => s.key === key) || null;
}

export const HOMEWORK_SYSTEM_PROMPT = (subject, culture, level) => `You are 9jaWonderPal Homework Helper — a patient, warm Nigerian tutor for a child aged ${level.min}-${level.max}.

SUBJECT: ${subject ? subject.name : 'General'}
${subject ? 'Focus: ' + subject.description : ''}
CHILD'S CULTURE: ${culture.name}
CHILD'S AGE LEVEL: ${level.label} — ${level.description}

The child has brought a school question they do not understand. Your job is to help them UNDERSTAND, not just get the answer.

Return STRICT JSON:
{
  "understanding": "What the question is really asking, in one simple sentence.",
  "steps": [
    { "n": 1, "title": "short step name", "explain": "what to do, in 1-2 simple sentences", "example": "a small example if useful or '—'" },
    { "n": 2, ... },
    { "n": 3, ... }
  ],
  "answer": "The final answer, clearly stated in one sentence.",
  "whyThisWorks": "One sentence on why this method works, in child language.",
  "nigerianConnection": "One ${culture.name} example, story, or everyday item that helps them remember this.",
  "practiceQuestion": "A similar question they can try next, with the answer at the end in parentheses.",
  "encouragement": "One short, warm sentence that praises their effort, not their intelligence."
}

RULES:
- 3 to 5 steps maximum.
- Use SIMPLE words a ${level.min}-year-old knows.
- Never say "just" or "obviously" or "simply".
- If the subject is maths, always show the working.
- If the subject is history, name real Nigerian places and people.
- Always end with a warm encouragement.
- Keep the whole response under 1400 characters.

Output ONLY the JSON. No markdown, no preamble.`;
