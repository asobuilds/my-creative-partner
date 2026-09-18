import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Loader2, Play } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { playExclusive, stopAll } from '../../engine/audioQueue';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

function resolveUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith('/')) return API + u;
  return API + '/' + u;
}

function Page({ page, index, mood, isLatest }) {
  const [speaking, setSpeaking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const audioRef = useRef(null);
  const autoPlayTimer = useRef(null);

  const speak = async () => {
    if (speaking) {
      stopAll();
      setSpeaking(false);
      return;
    }
    try {
      const text = page.narration || (page.title + '. ' + page.story);
      const res = await fetch(API + '/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      playExclusive(audio, () => setSpeaking(false));
      setSpeaking(true);
      setHasPlayedOnce(true);
    } catch (e) {
      console.error('speak failed', e);
    }
  };

  // Auto-play ONLY for the latest page, ONLY once, AFTER a short delay
  useEffect(() => {
    if (!isLatest || hasPlayedOnce) return;
    autoPlayTimer.current = setTimeout(() => { speak(); }, 900);
    return () => { if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current); };
    // eslint-disable-next-line
  }, [isLatest]);

  // Stop this page's audio on unmount
  useEffect(() => () => {
    if (audioRef.current) { try { audioRef.current.pause(); } catch (e) {} }
  }, []);

  const names = page.names || {};
  const hasNativeName = names.native && names.native !== '—';

  return (
    <div style={{
      marginBottom: 28, borderRadius: 22,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid ' + mood.primary + '33',
      overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
    }}>
      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#0a0812' }}>
        {!imageFailed && page.image && (
          <img src={resolveUrl(page.image)} alt={page.title}
            onLoad={() => setImageLoaded(true)} onError={() => setImageFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imageLoaded ? 1 : 0, transition: 'opacity .4s' }} />
        )}
        {!imageLoaded && !imageFailed && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mood.primary }}>
            <Loader2 size={20} className="spin" />
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 10, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', color: mood.primary, fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>
          PAGE {index + 1} · {page.mode ? page.mode.toUpperCase() : 'STORY'}
        </div>
        <button onClick={speak} title={speaking ? 'Stop' : 'Read this page'}
          style={{ position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: 14,
            background: speaking ? 'linear-gradient(135deg,#ffb700,#ff6b00)' : 'rgba(10,8,18,0.9)',
            backdropFilter: 'blur(14px)',
            border: '1px solid ' + (speaking ? '#ffb700' : mood.primary + '66'),
            color: speaking ? '#fff' : mood.primary, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {speaking ? <VolumeX size={18} /> : <Play size={16} />}
        </button>
      </div>

      <div style={{ padding: '22px 24px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px', color: '#fff', letterSpacing: -0.4 }}>{page.title}</h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: '#cbd5e1', margin: '0 0 18px' }}>{page.story}</p>

        {hasNativeName && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
              {page.cultureName ? 'In ' + page.cultureName : 'Say it'}
            </div>
            <div style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>
              {names.native}
              {names.english && names.english !== names.native && <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>({names.english})</span>}
            </div>
          </div>
        )}

        {page.proverb && page.proverb.text && page.proverb.text !== '—' && (
          <div style={{ margin: '16px 0', padding: '14px 16px', background: 'rgba(0,240,255,0.06)', border: '1px dashed ' + mood.primary + '66', borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{page.proverb.lang} proverb</div>
            <div style={{ fontSize: 15, fontStyle: 'italic', color: '#e2e8f0', marginBottom: 6, lineHeight: 1.5 }}>&ldquo;{page.proverb.text}&rdquo;</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>— {page.proverb.meaning}</div>
          </div>
        )}

        {page.fact && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>Did you know</div>
            <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{page.fact}</div>
          </div>
        )}

        {page.history && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#f472b6', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>From Nigeria</div>
            <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{page.history}</div>
          </div>
        )}

        {page.question && (
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: mood.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Wonder with me</div>
              <div style={{ fontSize: 14, fontStyle: 'italic', color: '#e2e8f0', lineHeight: 1.5 }}>{page.question}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookView() {
  const pages = useStudioStore((s) => s.pages);
  const mood = useStudioStore((s) => s.mood);
  const scrollRef = useRef(null);
  const prevCount = useRef(pages.length);

  useEffect(() => {
    if (pages.length > prevCount.current && scrollRef.current) {
      setTimeout(() => scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 200);
    }
    prevCount.current = pages.length;
  }, [pages.length]);

  useEffect(() => () => stopAll(), []);

  return (
    <div ref={scrollRef} style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--theme-bg)', paddingTop: 90, paddingBottom: 130, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {pages.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>Your book is empty</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>Tap the microphone and say what you want to make.<br />Every idea becomes a page.</div>
          </div>
        )}
        {pages.map((p, i) => (
          <Page key={p.id} page={p} index={i} mood={mood} isLatest={i === pages.length - 1} />
        ))}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
