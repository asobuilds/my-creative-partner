import 'dotenv/config';
import { completeJSON, llmReady } from '../adapters/llm.js';
import { aiImageUrl } from '../adapters/freeImage.js';
import { ensureCached } from '../adapters/imageProxy.js';
import { lookupSubject } from '../knowledge/nigeria.js';

const PAGE_SYSTEM = `You write ONE page of a storybook for a Nigerian child aged 4 to 8. Every word must earn its place.

Return STRICT JSON with this EXACT shape:
{
  "title": "3-5 word title, Title Case, evocative not descriptive",
  "story": "A 5-sentence story (60-90 words total) following a strict arc. See rules.",
  "imagePrompt": "A vivid illustration prompt: subject in an African setting, bright warm colours, illustrated storybook style, no text, no watermark",
  "names": { "yoruba": "...", "igbo": "...", "hausa": "...", "pidgin": "..." },
  "fact": "One surprising TRUE fact a 6-year-old can repeat to a friend. Max 14 words.",
  "history": "A REAL Nigerian history, tradition, or belief link. Max 22 words. If none exists, say so in one short honest sentence.",
  "proverb": { "text": "Real Yoruba/Igbo/Hausa proverb in original language", "meaning": "Short English translation", "lang": "Yoruba|Igbo|Hausa" },
  "question": "A single child-level wonder question that ends with ?",
  "sensory": { "smell": "one noun", "sound": "one noun", "colour": "one colour word" },
  "sticker": "one emoji representing the page (🦁 🦅 🥁 🌙 🐘 🌳 🐟 👑 🔥 🌧️ 💧 🌸 🪘 ✨)"
}

STORY ARC RULES (five sentences, in order):
1. Introduce a character by NAME with one specific trait. Make the child the hero or use the child's name if provided.
2. Show them noticing or feeling one thing (small problem, curiosity, beauty).
3. Show them DOING something about it.
4. Show one surprising or delightful result.
5. End on WONDER, not resolution — leave a gap the child fills.

SENSORY RULES:
- Use at least one smell word, one sound word, one colour word across the five sentences.
- Include at least one line of dialogue in quotation marks.
- No 'amazing', 'awesome', 'suddenly', 'finally', 'the end'.

CULTURE RULES:
- If the subject has a Yoruba/Igbo/Hausa name, use it. Add the English.
- If the subject is exotic (dragon, unicorn, robot), name a Nigerian equivalent and say why they differ.
- Real proverbs only. If unsure, use "—" for the whole proverb.
- History must be verifiable. Never invent.

Output ONLY the JSON. No markdown, no preamble, no explanation.`;

function fallbackPage() { return null; }


const STICKER_MAP = {
  lion: '🦁', tiger: '🐯', elephant: '🐘', giraffe: '🦒', zebra: '🦓', cheetah: '🐆',
  monkey: '🐒', gorilla: '🦍', snake: '🐍', tortoise: '🐢', turtle: '🐢', frog: '🐸',
  parrot: '🦜', eagle: '🦅', owl: '🦉', peacock: '🦚', fish: '🐟', shark: '🦈', whale: '��',
  cat: '🐱', dog: '🐶', horse: '🐴', bird: '🐦', butterfly: '🦋', bee: '🐝', spider: '🕷️',
  tree: '🌳', flower: '🌸', rose: '🌹', mushroom: '🍄', leaf: '🍃', palm: '🌴',
  sun: '☀️', moon: '🌙', star: '⭐', cloud: '☁️', rain: '🌧️', rainbow: '🌈',
  fire: '🔥', water: '💧', mountain: '⛰️', ocean: '🌊', river: '🏞️', island: '🏝️',
  drum: '🥁', king: '👑', queen: '👑', crown: '👑', castle: '��', house: '🏠',
  book: '📖', music: '🎵', child: '🧒', family: '👨‍👩‍👧',
  dragon: '🐉', unicorn: '🦄', dinosaur: '🦕', rocket: '🚀', robot: '🤖',
  car: '🚗', boat: '⛵', plane: '✈️', train: '🚂',
  apple: '🍎', banana: '🍌', mango: '🥭', pineapple: '🍍', coconut: '🥥',
};

function pickSticker(prompt, llmSticker) {
  if (llmSticker && llmSticker !== '✨' && llmSticker !== '?') return llmSticker;
  const lower = String(prompt || '').toLowerCase();
  for (const [key, emoji] of Object.entries(STICKER_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '✨';
}

export default function mountStoryPage(app) {
  app.post('/api/story/page', async (req, res) => {
    const { prompt, childName } = req.body || {};
    if (!prompt || String(prompt).trim().length < 2) {
      return res.status(400).json({ error: 'prompt required' });
    }

    const seed = lookupSubject(prompt);
    let page = null;

    if (llmReady) {
      const seedHint = seed ? '\n\nCULTURAL SEED (enrich, verify, do not contradict): ' + JSON.stringify(seed) : '';
      const userMsg = 'Child prompt: "' + prompt + '"' + (childName ? '\nHero name: ' + childName : '') + seedHint;
      try {
        page = await completeJSON(
          [{ role: 'system', content: PAGE_SYSTEM }, { role: 'user', content: userMsg }],
          { maxTokens: 1200, temperature: 0.85 }
        );
      } catch (e) {
        console.warn('[story/page] LLM failed:', e.message);
      }
    }

    if (!page || !page.story) {
      // Retry once with a simpler prompt for lower chance of failure
      console.warn('[story/page] first attempt failed — retrying with a shorter prompt');
      try {
        const retry = await completeJSON(
          [
            { role: 'system', content: 'Return STRICT JSON only. {"title": string, "story": string (5 sentences), "imagePrompt": string, "names": {"yoruba":string,"igbo":string,"hausa":string,"pidgin":string}, "fact": string, "history": string, "proverb": {"text":string,"meaning":string,"lang":string}, "question": string, "sticker": string}. No markdown.' },
            { role: 'user', content: 'Write a 5-sentence storybook page about: ' + prompt + (childName ? ' (hero: ' + childName + ')' : '') },
          ],
          { maxTokens: 900, temperature: 0.9 }
        );
        if (retry && retry.story) page = retry;
      } catch (e2) {
        console.warn('[story/page] retry failed:', e2.message);
      }
    }

    if (!page || !page.story) {
      console.error('[story/page] all LLM attempts failed for prompt:', prompt);
      return res.status(503).json({
        error: 'story_unavailable',
        message: 'The storyteller is resting. Please try again in a moment.',
        prompt,
      });
    }

    // Cache the image on disk so the browser gets it instantly
    const imagePrompt = (page.imagePrompt || prompt) + ', illustrated storybook, warm African colours, no text, no watermark';
    const remoteImage = aiImageUrl(imagePrompt, { width: 1024, height: 1024 });
    let image = remoteImage;
    try {
      image = await ensureCached(remoteImage, { timeoutMs: 40000, subject: prompt });
      console.log('[story/page] image cached ->', image);
    } catch (e) {
      console.warn('[story/page] image cache failed, using remote URL:', e.message);
    }

    const narrationParts = [
      page.title ? page.title + '.' : '',
      page.story || '',
      page.fact ? 'Did you know? ' + page.fact : '',
      page.history || '',
      page.proverb && page.proverb.text !== '—' ? 'A ' + page.proverb.lang + ' proverb says: ' + page.proverb.text + '. It means: ' + page.proverb.meaning : '',
      page.question || '',
    ].filter(Boolean);

    res.json({
      ok: true,
      id: 'page-' + Date.now(),
      ts: Date.now(),
      prompt: String(prompt).slice(0, 200),
      childName: childName || null,
      title: page.title || String(prompt).slice(0, 40),
      story: page.story || '',
      image,
      names: page.names || {},
      fact: page.fact || '',
      history: page.history || '',
      proverb: page.proverb || { text: '—', meaning: '—', lang: '—' },
      question: page.question || '',
      sensory: page.sensory || {},
      sticker: pickSticker(prompt, page.sticker),
      narration: narrationParts.join(' '),
      seedSource: seed ? seed._key : null,
    });
  });
}
