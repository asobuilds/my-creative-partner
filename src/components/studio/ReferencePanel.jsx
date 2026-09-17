import React, { useEffect, useRef, useState } from 'react';
import { Camera, Sparkles, X, Volume2, VolumeX, Loader2 } from 'lucide-react';

function resolveUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//.test(u)) return u;
  const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');
  if (u.startsWith('/')) return API + u;
  return API + '/' + u;
}


const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export default function ReferencePanel({ data, loading, onDismiss, mood, prompt }) {
  const m = mood || { primary: '#ffb700', accent: '#7c3aed' };
  const [imgFailed, setImgFailed] = useState(false);
  const [fact, setFact] = useState(null);
  const [factLoading, setFactLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const audioRef = useRef(null);

  // Fetch the fact for this subject
  useEffect(() => {
    if (!prompt) return;
    setFact(null);
    setSpoken(false);
    setFactLoading(true);
    fetch(API + '/api/reference/fact?q=' + encodeURIComponent(prompt))
      .then((r) => r.json())
      .then((j) => setFact(j))
      .catch(() => {})
      .finally(() => setFactLoading(false));
  }, [prompt]);

  // Auto-speak the fact once when ready
  useEffect(() => {
    if (!fact || spoken || !fact.fact) return;
    const text = fact.name + '. ' + fact.fact + ' ' + (fact.question || '');
    fetch(API + '/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => {});
        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        setSpoken(true);
      })
      .catch(() => setSpoken(true));
  }, [fact, spoken]);

  const replay = () => {
    if (!fact || !fact.fact) return;
    const text = fact.name + '. ' + fact.fact + ' ' + (fact.question || '');
    fetch(API + '/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => {});
        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
      })
      .catch(() => {});
  };

  const stop = () => {
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
      setSpeaking(false);
    }
  };

  if (!data && !loading && !fact) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 18, top: 76,
      width: 'min(320px, 44vw)',
      background: 'rgba(10,8,18,0.94)',
      backdropFilter: 'blur(20px)',
      border: '1px solid ' + m.primary + '55',
      borderRadius: 18,
      overflow: 'hidden',
      zIndex: 14,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      animation: 'refIn .4s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Camera size={13} color={m.primary} />
        <span style={{ flex: 1, color: m.primary, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          The real thing
        </span>
        {fact && (
          <button
            onClick={speaking ? stop : replay}
            title={speaking ? 'Stop' : 'Read aloud'}
            style={{ background: 'transparent', border: 'none', color: m.primary, cursor: 'pointer', padding: 4 }}
          >
            {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}
        <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#0a0812' }}>
        {loading && !data && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.primary, fontSize: 12 }}>
            <Loader2 size={18} className="spin" />
          </div>
        )}
        {!imgFailed && data && data.thumb && (
          <img
            src={resolveUrl(data.thumb)}
            alt={prompt}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {imgFailed && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 11, padding: 16, textAlign: 'center', background: '#0f0d1a' }}>
            Image loading…
          </div>
        )}
        {data && data.ai && !imgFailed && (
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: 'rgba(10,8,18,0.85)', color: m.primary, fontSize: 9, fontWeight: 800, letterSpacing: 0.6 }}>
            <Sparkles size={10} /> AI IMAGE
          </div>
        )}
      </div>

      {/* Fact block */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {factLoading && (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Writing a fact for you…</div>
        )}
        {fact && (
          <>
            <div style={{ color: m.primary, fontSize: 15, fontWeight: 800, marginBottom: 6, letterSpacing: -0.2 }}>
              {fact.name}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
              {fact.fact}
            </div>
            {fact.question && (
              <div style={{ color: '#94a3b8', fontSize: 12.5, fontStyle: 'italic' }}>
                {fact.question}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes refIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
