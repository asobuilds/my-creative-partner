import 'dotenv/config';
import { completeJSON, llmReady } from '../adapters/llm.js';
import { aiImageUrl } from '../adapters/freeImage.js';
import { ensureCached } from '../adapters/imageProxy.js';
import { lookupSubject } from '../knowledge/nigeria.js';
import { getCulture, ageLevel, AGE_LEVELS } from '../knowledge/cultures.js';

const MODES = {
  story: 'STORY',
  folklore: 'FOLKLORE',
  funfact: 'FUN_FACT',
  own: 'MAKE_YOUR_OWN',
};

function buildSystemPrompt(culture, level, mode) {
  const c = getCulture(culture);
  const lv = AGE_LEVELS[level] || AGE_LEVELS.discoverer;

  const base = `You write ONE page of a storybook for a Nigerian child aged ${lv.min}-${lv.max}.

CHILD'S CULTURE: ${c.name} (${c.autonym})
Region: ${c.region}
Core values: ${c.keyValues.join(', ')}
Traditional greeting: "${c.greeting.hi}" — reply "${c.greeting.response}"
Trickster/folk character: ${c.trickster}
Traditional fabric: ${c.fabric}
Traditional drum: ${c.drum}
Historical landmark: ${c.landmark}
A ${c.name} proverb: "${c.proverb.text}" — meaning: "${c.proverb.meaning}"

AGE LEVEL: ${lv.label} — ${lv.description}

`;

  const commonFields = `Return STRICT JSON with this EXACT shape:
{
  "title": "3-5 word title, Title Case",
  "story": "the main text, see mode rules below",
  "imagePrompt": "Vivid illustration prompt: subject in ${c.region}, wearing ${c.fabric}, ${c.colors.join('/')} colours, illustrated storybook style, no text, no watermark",
  "names": { "native": "the subject's name in ${c.name} language or '—'", "english": "the English name" },
  "fact": "One surprising TRUE fact about the subject. Max 14 words.",
  "history": "A REAL Nigerian history/tradition link, ${c.name} where possible. Max 22 words.",
  "proverb": { "text": "Real ${c.name} proverb in original Latin letters", "meaning": "Short English translation", "lang": "${c.name}" },
  "question": "A single child-level wonder question ending with ?",
  "sensory": { "smell": "one noun", "sound": "one noun", "colour": "one colour word" },
  "sticker": "one emoji representing the page",
  "localFact": "One specific thing a ${c.name} child would recognise from home. Max 12 words."
}
`;

  const modeRules = {
    story: `STORY MODE:
Write a 5-sentence story (60-90 words) with this exact arc:
1. Introduce a character by name with one specific trait.
2. They notice or feel one small thing.
3. They do something about it.
4. One surprising or delightful result.
5. End on WONDER, not resolution.
Use at least one smell word, one sound word, one colour word. Include one line of dialogue in "quotes".`,

    folklore: `FOLKLORE MODE:
Adapt a REAL ${c.name} folktale featuring ${c.trickster}. Use the traditional trickster's voice.
The "story" field must be a 5-sentence adaptation (60-90 words):
1. Set the scene with ${c.trickster} in a specific ${c.name} place.
2. ${c.trickster} faces a challenge or is being clever.
3. A clever trick or plan unfolds.
4. The trick works — or backfires.
5. End with the wisdom woven in, NOT stated as "the moral is...".
The "proverb" field MUST be a real ${c.name} proverb about cleverness or the trickster.`,

    funfact: `FUN FACT MODE:
The "story" field must contain THREE surprising TRUE facts about the subject, formatted as:
"Fact one. Fact two. Fact three."
Each fact 10-18 words. Each must be surprising to a child.
Do NOT write a narrative — only facts.
The "proverb" field can be shorter than usual.`,

    own: `MAKE-YOUR-OWN MODE:
The child's prompt is a STORY DIRECTION, not a subject. Example: "the lion was blue and ate clouds".
Honor the child's direction EXACTLY. Do NOT change their premise.
Write 5 sentences that EXPAND their idea:
1. Begin where their direction leaves off.
2. Add one sensory detail.
3. Add a small surprise.
4. Add dialogue.
5. End on wonder.
The title should reflect the child's own direction, not a generic subject.`,
  };

  const output = `
CRITICAL OUTPUT RULES:
- Your ENTIRE reply must be ONE valid JSON object.
- Start with { and end with }.
- Do NOT write "Here is a story" or any prefix.
- Do NOT wrap in markdown code fences.
- Every string value must be on one line (no literal newlines inside strings).
- Keep total response under 1500 characters.
- If you cannot think of a real proverb, set "text": "—" and "meaning": "—".
- Proverb MUST use ONLY Latin letters. No Japanese, Chinese, Arabic, Cyrillic.

Output ONLY the JSON.`;

  return base + commonFields + '\n' + modeRules[mode] + '\n' + output;
}

export default function mountStoryPage(app) {
  app.post('/api/story/page', async (req, res) => {
    const { prompt, childName, childAge, culture, interests, mode: rawMode } = req.body || {};
    if (!prompt || String(prompt).trim().length < 2) {
      return res.status(400).json({ error: 'prompt required' });
    }

    const mode = MODES[rawMode] ? rawMode : 'story';
    const cultureKey = culture || 'mixed';
    const level = ageLevel(childAge || 7);
    const subject = lookupSubject(prompt);
    const c = getCulture(cultureKey);

    if (!llmReady) {
      return res.status(503).json({ error: 'llm_unavailable', message: 'The storyteller needs an API key.' });
    }

    const systemPrompt = buildSystemPrompt(cultureKey, level, mode);

    // Parallel: image fetch starts immediately, LLM in parallel
    const imagePrompt = prompt + ', illustrated storybook style, ' + c.name + ' Nigerian setting, warm colours, no text, no watermark';
    const remoteImage = aiImageUrl(imagePrompt, { width: 1024, height: 1024 });
    const imagePromise = ensureCached(remoteImage, { timeoutMs: 40000, subject: prompt })
      .catch(() => remoteImage);

    const pagePromise = (async () => {
      const seedHint = subject ? '\n\nREFERENCE SUBJECT DATA: ' + JSON.stringify(subject) : '';
      const userMsg = 'Child prompt: "' + prompt + '"'
        + (childName ? '\nHero name: ' + childName : '')
        + (childAge ? '\nChild age: ' + childAge : '')
        + (interests && interests.length ? '\nChild interests: ' + interests.join(', ') : '')
        + '\nCulture: ' + c.name
        + '\nMode: ' + mode.toUpperCase()
        + seedHint;

      let page = null;
      try {
        page = await completeJSON(
          [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
          { maxTokens: 2500, temperature: 0.75 }
        );
      } catch (e) {
        console.warn('[story/page] attempt 1 failed:', e.message);
      }
      if (!page || !page.story) {
        try {
          const retry = await completeJSON(
            [
              { role: 'system', content: 'Return STRICT JSON only. {"title":string,"story":string,"imagePrompt":string,"names":{"native":string,"english":string},"fact":string,"history":string,"proverb":{"text":string,"meaning":string,"lang":string},"question":string,"sticker":string}. No markdown.' },
              { role: 'user', content: 'Write a ' + mode + ' page for a ' + c.name + ' child about: ' + prompt },
            ],
            { maxTokens: 1800, temperature: 0.75 }
          );
          if (retry && retry.story) page = retry;
        } catch (e) {
          console.warn('[story/page] retry failed:', e.message);
        }
      }
      return page;
    })();

    const [image, page] = await Promise.all([imagePromise, pagePromise]);

    if (!page || !page.story) {
      return res.status(503).json({ error: 'story_unavailable', message: 'The storyteller is resting. Try again in a moment.' });
    }

    const narrationParts = [
      page.title ? page.title + '.' : '',
      page.story || '',
      page.fact ? 'Did you know? ' + page.fact : '',
      page.history || '',
      page.localFact ? 'Something from your home: ' + page.localFact : '',
      page.proverb && page.proverb.text !== '—' ? 'A ' + c.name + ' proverb says: ' + page.proverb.text + '. It means: ' + page.proverb.meaning : '',
      page.question || '',
    ].filter(Boolean);

    res.json({
      ok: true,
      id: 'page-' + Date.now(),
      ts: Date.now(),
      mode,
      prompt: String(prompt).slice(0, 200),
      childName: childName || null,
      childAge: childAge || null,
      culture: cultureKey,
      cultureName: c.name,
      ageLevel: level,
      title: page.title || String(prompt).slice(0, 40),
      story: page.story || '',
      image,
      names: page.names || {},
      fact: page.fact || '',
      history: page.history || '',
      localFact: page.localFact || '',
      proverb: page.proverb || { text: '—', meaning: '—', lang: '—' },
      question: page.question || '',
      sensory: page.sensory || {},
      sticker: page.sticker || '✨',
      narration: narrationParts.join(' '),
    });
  });
}
