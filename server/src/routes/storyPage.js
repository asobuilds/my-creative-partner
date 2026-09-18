import 'dotenv/config';
import { completeJSON, llmReady } from '../adapters/llm.js';
import { aiImageUrl } from '../adapters/freeImage.js';
import { ensureCached } from '../adapters/imageProxy.js';
import { lookupSubject } from '../knowledge/nigeria.js';
import { getCulture, ageLevel, AGE_LEVELS } from '../knowledge/cultures.js';

function buildSystemPrompt(culture, level) {
  const c = getCulture(culture);
  const lv = AGE_LEVELS[level] || AGE_LEVELS.discoverer;
  return `You write ONE page of a storybook for a Nigerian child aged ${lv.min}-${lv.max}.

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

Return STRICT JSON with this EXACT shape:
{
  "title": "3-5 word title, Title Case",
  "story": "5 sentences (60-90 words) with a strict arc: character introduced by name; they notice something; they do something; surprising result; ends on wonder.",
  "imagePrompt": "Vivid illustration prompt: subject in ${c.region}, wearing ${c.fabric}, ${c.colors.join('/')} colours, illustrated storybook style, no text, no watermark",
  "names": { "native": "the subject's name in the child's culture language or '—'", "english": "the English name" },
  "fact": "One surprising TRUE fact about the subject. Max 14 words.",
  "history": "A REAL Nigerian history/tradition link, ${c.name} where possible. Max 22 words.",
  "proverb": { "text": "Real ${c.name} proverb in original language", "meaning": "Short English translation", "lang": "${c.name}" },
  "question": "A single child-level wonder question ending with ?",
  "sensory": { "smell": "one noun", "sound": "one noun", "colour": "one colour word" },
  "sticker": "one emoji representing the page",
  "localFact": "One specific thing a ${c.name} child would recognise from home. Max 12 words."
}

RULES:
- Use ONLY ${c.name} culture. Do not mix in other cultures.
- Write ONLY in English, except for one short proverb in ${c.name}.
- Do NOT use any non-Latin characters (no Japanese, Chinese, Arabic, Cyrillic). If you do not know the ${c.name} spelling, transliterate to Latin letters.
- The proverb must be written ONLY in Latin letters. If unsure of the exact wording, use "—".
- Stories must be exactly 5 sentences, no more, no less.
- Story must stay under 90 words total.
- Use authentic ${c.name} proverbs. If unsure, use "—".
- Use authentic ${c.name} names. If unsure, use "—".
- Never use "amazing", "awesome", "suddenly", "finally".
- ${lv.label} level: ${lv.description}
- If the subject is exotic (dragon, robot), name a ${c.name} equivalent and say why they differ.

Output ONLY the JSON. No markdown, no preamble.`;
}

export default function mountStoryPage(app) {
  app.post('/api/story/page', async (req, res) => {
    const { prompt, childName, childAge, culture, interests } = req.body || {};
    if (!prompt || String(prompt).trim().length < 2) {
      return res.status(400).json({ error: 'prompt required' });
    }

    const cultureKey = culture || 'mixed';
    const level = ageLevel(childAge || 7);
    const subject = lookupSubject(prompt);

    if (!llmReady) {
      return res.status(503).json({ error: 'llm_unavailable', message: 'The storyteller needs an API key.' });
    }

    const systemPrompt = buildSystemPrompt(cultureKey, level);
    const seedHint = subject ? '\n\nREFERENCE SUBJECT DATA: ' + JSON.stringify(subject) : '';
    const userMsg = 'Child prompt: "' + prompt + '"'
      + (childName ? '\nHero name: ' + childName : '')
      + (childAge ? '\nChild age: ' + childAge : '')
      + (interests && interests.length ? '\nChild interests: ' + interests.join(', ') : '')
      + '\nCulture: ' + getCulture(cultureKey).name
      + seedHint;

    const c = getCulture(cultureKey);

    // Parallel: kick off image fetch immediately using the raw prompt,
    // and the LLM call in parallel. Image takes ~3s, LLM ~5s.
    const imagePrompt = prompt + ', illustrated storybook style, ' + c.name + ' Nigerian setting, warm colours, no text, no watermark';
    const remoteImage = aiImageUrl(imagePrompt, { width: 1024, height: 1024 });
    const imagePromise = ensureCached(remoteImage, { timeoutMs: 40000, subject: prompt })
      .catch(() => remoteImage);

    const pagePromise = (async () => {
      if (!llmReady) return null;
      const seedHint = subject ? '\n\nREFERENCE SUBJECT DATA: ' + JSON.stringify(subject) : '';
      const userMsg = 'Child prompt: "' + prompt + '"'
        + (childName ? '\nHero name: ' + childName : '')
        + (childAge ? '\nChild age: ' + childAge : '')
        + (interests && interests.length ? '\nChild interests: ' + interests.join(', ') : '')
        + '\nCulture: ' + c.name
        + seedHint;

      let page = null;
      try {
        page = await completeJSON(
          [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
          { maxTokens: 2500, temperature: 0.7 }
        );
      } catch (e) {
        console.warn('[story/page] LLM attempt 1 failed:', e.message);
      }
      if (!page || !page.story) {
        try {
          const retry = await completeJSON(
            [
              { role: 'system', content: 'Return STRICT JSON only. {"title":string,"story":string (5 sentences),"imagePrompt":string,"names":{"native":string,"english":string},"fact":string,"history":string,"proverb":{"text":string,"meaning":string,"lang":string},"question":string,"sticker":string}. No markdown.' },
              { role: 'user', content: 'Write a 5-sentence storybook page for a ' + c.name + ' child about: ' + prompt },
            ],
            { maxTokens: 1800, temperature: 0.7 }
          );
          if (retry && retry.story) page = retry;
        } catch (e) {
          console.warn('[story/page] LLM retry failed:', e.message);
        }
      }
      return page;
    })();

    const [image, page] = await Promise.all([imagePromise, pagePromise]);


    
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
