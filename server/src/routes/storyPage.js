import 'dotenv/config';
import { completeJSON, llmReady } from '../adapters/llm.js';
import { aiImageUrl } from '../adapters/freeImage.js';
import { lookupSubject } from '../knowledge/nigeria.js';

const PAGE_SYSTEM = `You are 9jaWonderPal — a friendly storyteller for Nigerian children aged 4 to 10.

Given a child's prompt, produce ONE storybook page.

Return STRICT JSON:
{
  "title": "3-5 word title, Title Case",
  "story": "2 or 3 short sentences. Child is the hero. Warm, gentle, curious. No 'the end'.",
  "imagePrompt": "detailed prompt for an AI illustrator: African setting, bright colours, child-friendly, no text, no watermark",
  "names": {
    "yoruba": "Yoruba name or '—'",
    "igbo": "Igbo name or '—'",
    "hausa": "Hausa name or '—'",
    "pidgin": "Nigerian Pidgin name or '—'"
  },
  "fact": "One surprising, true fact a 6-year-old can understand. Max 16 words.",
  "history": "One real Nigerian history or tradition link. Max 20 words. If none exists, say so honestly.",
  "proverb": {
    "text": "A real proverb from Yoruba, Igbo, or Hausa. If none fits, return '—'.",
    "meaning": "Short English translation.",
    "lang": "Yoruba or Igbo or Hausa"
  },
  "question": "One warm wonder question for the child. Max 12 words. Ends with ?"
}

Rules:
- Nigeria-first. Where the subject has a Nigerian name or story, use it.
- If the subject is exotic (dragon, unicorn, spaceship), say what it is in a Nigerian frame — 'dragons are not common in Nigerian stories, but we have...' and give the closest local equivalent.
- Facts must be TRUE. No myths dressed as facts.
- Proverbs must be REAL. If you are not sure, use '—'.
- Story must be gentle. No fear, no violence, no death.
- No 'amazing', 'awesome', 'great job'.

Output ONLY the JSON. No markdown, no preamble.`;

function fallbackPage(prompt, seed) {
  const subject = String(prompt || '').trim().slice(0, 40) || 'a wonder';
  return {
    title: seed ? seed.en : (subject[0].toUpperCase() + subject.slice(1)),
    story: 'You found ' + subject + ' today. You looked closely, and it looked back at you. You wondered what it was thinking.',
    imagePrompt: 'an illustrated ' + subject + ' in a warm Nigerian village setting, bright colours, child-friendly, no text',
    names: seed ? { yoruba: seed.yoruba, igbo: seed.igbo, hausa: seed.hausa, pidgin: seed.pidgin } : { yoruba: '—', igbo: '—', hausa: '—', pidgin: '—' },
    fact: seed ? seed.fact : 'Every ' + subject + ' has a story worth telling.',
    history: seed ? seed.history : 'Nigeria has over 250 ethnic groups, each with its own stories.',
    proverb: seed ? { text: seed.proverb.text, meaning: seed.proverb.meaning, lang: seed.proverb.lang } : { text: '—', meaning: '—', lang: '—' },
    question: 'What do you think it dreams about?',
  };
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
      const seedHint = seed ? '\n\nKNOWN CULTURAL SEED (verify, enrich, but do not contradict): ' + JSON.stringify(seed) : '';
      const userMsg = 'Child\'s prompt: "' + prompt + '"' + (childName ? '\nChild\'s name: ' + childName : '') + seedHint;
      try {
        page = await completeJSON(
          [{ role: 'system', content: PAGE_SYSTEM }, { role: 'user', content: userMsg }],
          { maxTokens: 900, temperature: 0.75 }
        );
      } catch (e) {
        console.warn('[story/page] LLM failed:', e.message);
      }
    }

    if (!page || !page.story) {
      page = fallbackPage(prompt, seed);
    }

    // Build a rich image prompt from the page
    const imagePrompt = (page.imagePrompt || prompt) + ', illustrated storybook style, warm African colours, no text, no watermark';
    const image = aiImageUrl(imagePrompt, { width: 1024, height: 1024 });

    // Assemble the narration text (for TTS)
    const narrationParts = [
      page.title ? 'Page title: ' + page.title + '.' : '',
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
      narration: narrationParts.join(' '),
      seedSource: seed ? seed._key : null,
    });
  });
}
