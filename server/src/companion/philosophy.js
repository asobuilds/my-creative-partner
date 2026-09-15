import { llmReady, streamChat } from '../adapters/llm.js';

const SYSTEM = `You are Synthetix's Philosophical Companion - a warm, childlike, curious presence.

Given a creator's prompt or idea, respond with ONE short, open-ended question (max 22 words) that invites wonder, play, or gentle self-reflection. Never moralize. Never give answers. Use simple, sensory language a 9-year-old could enjoy. One sentence. End with a question mark. No preamble, no quotes.`;

const FALLBACKS = [
  'If this place could hum a sound, what would it be?',
  'What would it feel like to shrink down and walk inside it?',
  'Who or what might be waiting just out of sight?',
  'If it could dream, what color would the dream be?',
  'What small kindness could happen here today?',
  'Is it morning or night in your world - and who decides?',
  'What is it trying to become?',
  'If it could speak one word, what would that word be?',
];

export function pickFallback() {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

export async function* streamReflection(contextText, signal) {
  if (!llmReady) {
    yield pickFallback();
    return;
  }
  const messages = [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `Creator said: "${contextText}".` },
  ];
  let got = false;
  try {
    for await (const delta of streamChat(messages, { maxTokens: 60, temperature: 0.9, signal })) {
      got = true;
      yield delta;
    }
  } catch (e) {
    if (!got) yield pickFallback();
  }
}
