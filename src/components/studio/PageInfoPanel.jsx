import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles, Loader2, Send } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useAccountStore } from '../../store/accountStore';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

const SECTION_PROMPTS = {
  proverb: 'Explain this proverb to a child aged {age}. Tell them what it means and give one small example they would understand. Then ask them one question about it.',
  fact: 'Explain this fact to a child aged {age} in a warm, curious way. Add one surprising extra fact they would love. End with a question.',
  history: 'Tell this piece of Nigerian history to a child aged {age} as a tiny story. Include one specific person, place, or moment. End with a wonder question.',
  wonder: 'Ask this child aged {age} three more wonder questions that follow naturally from this one. Keep them playful and imaginative, not school-like.',
};

export default function PageInfoPanel({ open, onClose, section, page }) {
  const mood = useStudioStore((s) => s.mood);
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open || !section || !page) return;
    setMessages([]);
    askAbout(section);
    // eslint-disable-next-line
  }, [open, section, page?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function askAbout(kind) {
    const age = activeChild?.age || 7;
    const template = SECTION_PROMPTS[kind] || SECTION_PROMPTS.proverb;
    const sysPrompt = template.replace('{age}', String(age));

    const seedContent = (() => {
      if (kind === 'proverb') return 'Proverb: "' + (page.proverb?.text || '') + '" — meaning: ' + (page.proverb?.meaning || '') + '. Culture: ' + (page.cultureName || 'Nigerian') + '.';
      if (kind === 'fact') return 'Fact: ' + (page.fact || '');
      if (kind === 'history') return 'History: ' + (page.history || '');
      if (kind === 'wonder') return 'Child asked: "' + (page.question || '') + '"';
      return '';
    })();

    const initial = [
      { role: 'system', content: sysPrompt + ' Child culture: ' + (page.cultureName || 'Nigerian') + '. Keep it warm, simple, and never preachy.' },
      { role: 'user', content: seedContent },
    ];

    setMessages([{ role: 'user', content: seedContent, local: true }]);
    setLoading(true);
    try {
      const res = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initial }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: json.text || '(no response)' }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'I could not think just now. Try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFollowUp() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: json.text || '(no response)' }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const label = section === 'proverb' ? 'The proverb' : section === 'fact' ? 'Did you know' : section === 'history' ? 'From Nigeria' : 'Wonder with me';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}>
      <div style={{ width: '100%', maxWidth: 640, maxHeight: '85vh', background: '#0f0c1a', border: '1px solid ' + mood.primary + '66', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color={mood.primary} />
          <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: mood.primary, letterSpacing: 0.4 }}>{label}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', padding: '12px 16px', borderRadius: 14, background: m.role === 'user' ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid ' + (m.role === 'user' ? mood.primary + '55' : 'rgba(255,255,255,0.08)'), color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: 12, color: mood.primary, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} className="spin" /> Thinking…
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendFollowUp(); }} style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask more…" disabled={loading}
            style={{ flex: 1, padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', outline: 'none', fontSize: 14 }} />
          <button type="submit" disabled={!input.trim() || loading}
            style={{ width: 46, height: 46, borderRadius: 12, background: input.trim() && !loading ? 'linear-gradient(135deg,' + mood.primary + ',' + mood.accent + ')' : 'rgba(255,255,255,0.06)', border: 'none', color: input.trim() ? '#000' : '#64748b', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
