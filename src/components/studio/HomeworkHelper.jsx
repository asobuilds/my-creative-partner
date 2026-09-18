import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Mic, Send, Loader2, Check, Lightbulb, Star, ArrowLeft } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useAccountStore } from '../../store/accountStore';
import { useVoicePrompt } from '../../hooks/useVoicePrompt';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export default function HomeworkHelper({ onClose }) {
  const mood = useStudioStore((s) => s.mood);
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const [question, setQuestion] = useState('');
  const [subjectKey, setSubjectKey] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const age = activeChild?.age || 7;
    fetch(API + '/api/homework/subjects?age=' + age)
      .then((r) => r.json())
      .then((j) => {
        const enabled = new Set(activeChild?.enabledSubjects || []);
        setSubjects((j.subjects || []).filter((s) => enabled.size === 0 || enabled.has(s.key)));
      })
      .catch(() => {});
  }, [activeChild]);

  const { listening, toggle: toggleVoice, supported } = useVoicePrompt({
    onFinal: (text) => { setQuestion(text); if (inputRef.current) inputRef.current.value = text; },
  });

  const ask = async () => {
    const q = (inputRef.current?.value || question || '').trim();
    if (q.length < 3 || loading) return;
    setQuestion(q);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(API + '/api/homework/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          subjectKey,
          childName: activeChild?.name,
          childAge: activeChild?.age,
          culture: activeChild?.culture,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message || json.error || 'Try again in a moment.');
      } else {
        setResult(json);
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0812', overflowY: 'auto', zIndex: 40, paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to book
        </button>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#fff', letterSpacing: -0.5 }}>Homework Helper</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            Bring a school question. {activeChild ? activeChild.name : 'Your child'} will get a step-by-step explanation, not just an answer.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Subject</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {subjects.map((s) => (
              <button key={s.key} onClick={() => setSubjectKey(subjectKey === s.key ? null : s.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
                  background: subjectKey === s.key ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid ' + (subjectKey === s.key ? '#f59e0b' : 'rgba(255,255,255,0.08)'),
                  color: '#e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <span>{s.emoji}</span> {s.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(15,12,26,0.7)', border: '1px solid ' + mood.primary + '33', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>The question</div>
          <textarea ref={inputRef} defaultValue={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste or type the school question. Or tap the mic and say it out loud."
            rows={3}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, color: '#fff', outline: 'none', fontSize: 15, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            {supported && (
              <button type="button" onClick={toggleVoice}
                style={{ padding: '12px 16px', borderRadius: 12,
                  background: listening ? 'linear-gradient(135deg,#ffb700,#ff6b00)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid ' + (listening ? '#ffb700' : 'rgba(255,255,255,0.12)'),
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mic size={14} /> {listening ? 'Listening…' : 'Speak'}
              </button>
            )}
            <button onClick={ask} disabled={loading}
              style={{ padding: '12px 22px', borderRadius: 12,
                background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, ' + mood.primary + ', ' + mood.accent + ')',
                border: 'none', color: loading ? '#64748b' : '#000',
                fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={15} className="spin" /> Thinking…</> : <><Send size={14} /> Help me understand</>}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 14, color: '#fca5a5', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {result && (
          <div>
            <div style={{ padding: 18, background: 'rgba(0,240,255,0.06)', border: '1px solid ' + mood.primary + '44', borderRadius: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>What this is really asking</div>
              <div style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.6 }}>{result.understanding}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              {result.steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
                  <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 10, background: mood.primary, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                    {s.n || i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: s.example && s.example !== '—' ? 8 : 0 }}>{s.explain}</div>
                    {s.example && s.example !== '—' && (
                      <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,0.08)', border: '1px dashed rgba(167,139,250,0.4)', borderRadius: 10, fontSize: 13, color: '#c4b5fd', fontStyle: 'italic' }}>
                        e.g. {s.example}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 18, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                <Check size={12} /> The answer
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{result.answer}</div>
              <div style={{ fontSize: 13, color: '#86efac', lineHeight: 1.5 }}>{result.whyThisWorks}</div>
            </div>

            {result.nigerianConnection && (
              <div style={{ padding: 16, background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.35)', borderRadius: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#f472b6', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>From home</div>
                <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>{result.nigerianConnection}</div>
              </div>
            )}

            {result.practiceQuestion && (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                  <Lightbulb size={12} /> Try one more
                </div>
                <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>{result.practiceQuestion}</div>
              </div>
            )}

            <div style={{ padding: 16, background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(255,107,0,0.08))', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Star size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 15, color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>{result.encouragement}</div>
            </div>
          </div>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
