import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

function resolveUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith('/')) return API + u;
  return API + '/' + u;
}

function Page({ page, index, mood }) {
  const [speaking, setSpeaking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const audioRef = useRef(null);

  const speak = async () => {
    if (speaking) {
      try { audioRef.current?.pause(); } catch (e) {}
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
      audio.play().catch(() => {});
      setSpeaking(true);
      audio.onended = () => setSpeaking(false);
    } catch (e) {
      console.error('speak failed', e);
    }
  };

  // Auto-play narration on first appearance
  useEffect(() => {
    const t = setTimeout(() => speak(), 400);
    return () => { clearTimeout(t); try { audioRef.current?.pause(); } catch (e) {} };
    // eslint-disable-next-line
  }, []);

  const names = page.names || {};
  const hasNames = names.yoruba && names.yoruba !== '—';

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 22,
      background: 'rgba(15,12,26,0.7)',
      border: '1px solid ' + mood.primary + '33',
      overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
    }}>
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#0a0812' }}>
        {!imageFailed && page.image && (
          <img
            src={resolveUrl(page.image)}
            alt={page.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: imageLoaded ? 1 : 0, transition: 'opacity .4s',
            }}
          />
        )}
        {!imageLoaded && !imageFailed && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mood.primary }}>
            <Loader2 size={20} className="spin" />
          </div>
        )}
        {imageFailed && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 12, textAlign: 'center', padding: 20 }}>
            Image could not load — but the story is here
          </div>
        )}

        {/* Page number chip */}
        <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 10, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', color: mood.primary, fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>
          PAGE {index + 1}
        </div>

        {/* Speaker button */}
        <button
          onClick={speak}
          title={speaking ? 'Stop' : 'Read this page'}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 40, height: 40, borderRadius: 12,
            background: speaking ? 'linear-gradient(135deg,#ffb700,#ff6b00)' : 'rgba(10,8,18,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid ' + (speaking ? '#ffb700' : mood.primary + '66'),
            color: speaking ? '#fff' : mood.primary,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Text body */}
      <div style={{ padding: '24px 26px 26px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px', color: '#fff', letterSpacing: -0.5 }}>
          {page.title}
        </h2>

        <p style={{ fontSize: 16, lineHeight: 1.65, color: '#cbd5e1', margin: '0 0 20px' }}>
          {page.story}
        </p>

        {/* Nigerian names */}
        {hasNames && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
              Say it in our languages
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                { lang: 'Yoruba', word: names.yoruba },
                { lang: 'Igbo', word: names.igbo },
                { lang: 'Hausa', word: names.hausa },
                { lang: 'Pidgin', word: names.pidgin },
              ].filter((x) => x.word && x.word !== '—').map((x) => (
                <div key={x.lang} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>{x.lang}</div>
                  <div style={{ fontSize: 15, color: '#fff', fontWeight: 700, marginTop: 2 }}>{x.word}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proverb */}
        {page.proverb && page.proverb.text && page.proverb.text !== '—' && (
          <div style={{ margin: '20px 0', padding: '16px 18px', background: 'rgba(0,240,255,0.06)', border: '1px dashed ' + mood.primary + '66', borderRadius: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: mood.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
              {page.proverb.lang} proverb
            </div>
            <div style={{ fontSize: 15, fontStyle: 'italic', color: '#e2e8f0', marginBottom: 8, lineHeight: 1.5 }}>
              &ldquo;{page.proverb.text}&rdquo;
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              — {page.proverb.meaning}
            </div>
          </div>
        )}

        {/* Fact */}
        {page.fact && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
              Did you know
            </div>
            <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>
              {page.fact}
            </div>
          </div>
        )}

        {/* History */}
        {page.history && (
          <div style={{ marginBottom: 20, padding: '12px 14px', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#f472b6', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
              From Nigeria
            </div>
            <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>
              {page.history}
            </div>
          </div>
        )}

        {/* Companion question */}
        {page.question && (
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: mood.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                Wonder with me
              </div>
              <div style={{ fontSize: 14, fontStyle: 'italic', color: '#e2e8f0', lineHeight: 1.5 }}>
                {page.question}
              </div>
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
      setTimeout(() => {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 150);
    }
    prevCount.current = pages.length;
  }, [pages.length]);

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'absolute', inset: 0,
        overflowY: 'auto',
        background: 'radial-gradient(circle at 50% 15%, ' + mood.primary + '12 0%, #0a0812 55%)',
        paddingTop: 90,
        paddingBottom: 130,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {pages.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>
              Your book is empty
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              Tap the microphone and say what you want to make.<br />
              Every idea becomes a page.
            </div>
          </div>
        )}
        {pages.map((p, i) => (
          <Page key={p.id} page={p} index={i} mood={mood} />
        ))}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
