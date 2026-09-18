import 'dotenv/config';
import { completeJSON, llmReady } from '../adapters/llm.js';
import { getCulture, ageLevel, AGE_LEVELS } from '../knowledge/cultures.js';
import { getSubject, HOMEWORK_SYSTEM_PROMPT } from '../knowledge/curriculum.js';

export default function mountHomework(app) {
  app.post('/api/homework/help', async (req, res) => {
    const { question, subjectKey, childName, childAge, culture } = req.body || {};
    if (!question || String(question).trim().length < 3) {
      return res.status(400).json({ error: 'question required' });
    }
    if (!llmReady) {
      return res.status(503).json({ error: 'llm_unavailable' });
    }

    const subject = getSubject(subjectKey) || null;
    const c = getCulture(culture || 'mixed');
    const level = ageLevel(childAge || 7);
    const lv = AGE_LEVELS[level];

    const system = HOMEWORK_SYSTEM_PROMPT(subject, c, lv);
    const userMsg = 'Child: ' + (childName || 'a child') + '\nQuestion from school: "' + String(question).slice(0, 800) + '"';

    try {
      const result = await completeJSON(
        [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
        { maxTokens: 2000, temperature: 0.6 }
      );
      if (!result || !result.steps) {
        return res.status(503).json({ error: 'helper_unavailable', message: 'Let us try again in a moment.' });
      }
      res.json({
        ok: true,
        id: 'hw-' + Date.now(),
        ts: Date.now(),
        subjectKey: subject ? subject.key : null,
        subjectName: subject ? subject.name : 'General',
        cultureName: c.name,
        childName: childName || null,
        question: String(question).slice(0, 800),
        understanding: result.understanding || '',
        steps: Array.isArray(result.steps) ? result.steps.slice(0, 6) : [],
        answer: result.answer || '',
        whyThisWorks: result.whyThisWorks || '',
        nigerianConnection: result.nigerianConnection || '',
        practiceQuestion: result.practiceQuestion || '',
        encouragement: result.encouragement || 'You did well for trying.',
      });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.get('/api/homework/subjects', (req, res) => {
    const age = Number(req.query.age) || 7;
    import('../knowledge/curriculum.js').then(({ subjectsForAge }) => {
      res.json({ subjects: subjectsForAge(age) });
    });
  });
}
