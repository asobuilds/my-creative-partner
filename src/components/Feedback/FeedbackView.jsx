import React, { useState } from 'react';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { useFeedbackStore } from '../../store/feedbackStore';

export default function FeedbackView() {
  const items = useFeedbackStore((s) => s.items);
  const submit = useFeedbackStore((s) => s.submit);
  const clear = useFeedbackStore((s) => s.clear);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const send = (source) => {
    if (!text.trim()) return;
    submit(text, { source });
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', marginBottom: 16 }}>
            <MessageSquare size={26} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: -0.5 }}>Feedback</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            We build every feature from what Nigerian families tell us. Your words shape the next version.
          </p>
        </div>

        {sent && (
          <div style={{ padding: 16, background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: 14, color: '#86efac', fontSize: 14, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            Thank you — your voice helps us serve Nigeria's children better.
          </div>
        )}

        <div style={{ background: 'rgba(15,12,26,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 32 }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="A feature you want. A story that worked. A bug you found."
            rows={5}
            style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
          <button onClick={() => send('sidebar')} disabled={!text.trim()}
            style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: text.trim() ? 'linear-gradient(135deg,#ffb700,#ff6b00)' : 'rgba(255,255,255,0.06)', color: text.trim() ? '#000' : '#64748b', border: 'none', fontSize: 14, fontWeight: 800, cursor: text.trim() ? 'pointer' : 'not-allowed' }}>
            <Send size={14} /> Send feedback
          </button>
        </div>

        {items.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.2, textTransform: 'uppercase' }}>Your history ({items.length})</div>
              <button onClick={() => { if (confirm('Clear feedback history?')) clear(); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                <Trash2 size={11} /> Clear
              </button>
            </div>
            {[...items].reverse().map((it) => (
              <div key={it.id} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 6 }}>{it.text}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(it.ts).toLocaleString()} · {it.source}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
