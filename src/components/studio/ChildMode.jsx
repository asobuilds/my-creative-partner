import React, { useEffect, useRef, useState } from 'react';
import BookView from './BookView';
import { useStudioStore } from '../../store/studioStore';
import { useAccountStore } from '../../store/accountStore';
import { useVoicePrompt } from '../../hooks/useVoicePrompt';
import { useStoryPage } from '../../hooks/useStoryPage';
import { startMoodSync } from '../../engine/moodEngine';
import { Mic, Sparkles, Save, RotateCcw, Volume2, VolumeX, History, Share2, BookOpen, Award, Play, X } from 'lucide-react';

function resolveUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//.test(u)) return u;
  const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');
  if (u.startsWith('/')) return API + u;
  return API + '/' + u;
}


const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export default function ChildMode() {
  const mood = useStudioStore((s) => s.mood);
  const muted = useStudioStore((s) => s.voiceMuted);
  const toggleMuted = useStudioStore((s) => s.toggleVoiceMuted);
  const pages = useStudioStore((s) => s.pages);
  const stickers = useStudioStore((s) => s.stickers);
  const clearPages = useStudioStore((s) => s.clearPages);
  const saveCurrentBook = useStudioStore((s) => s.saveCurrentBook);
  const attachVideoToBook = useStudioStore((s) => s.attachVideoToBook);

  const [savedToast, setSavedToast] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastTitle, setLastTitle] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyUrl, setStoryUrl] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [lastBookId, setLastBookId] = useState(null);
  const inputRef = useRef(null);

  const getActiveChild = useAccountStore((s) => s.getActiveChild);
  const activeChild = getActiveChild();
  const { createPage } = useStoryPage();

  useEffect(() => { startMoodSync(); }, []);

  // Auto-open video modal when ready
  useEffect(() => {
    if (storyUrl) setShowVideoModal(true);
  }, [storyUrl]);

  const submit = async (text) => {
    const clean = String(text || '').trim();
    if (!clean || busy) return;
    setBusy(true);
    setLastTitle(clean);
    if (inputRef.current) inputRef.current.value = '';
    try {
      await createPage(clean, {
        childName: activeChild?.name,
        childAge: activeChild?.age,
        culture: activeChild?.culture,
        interests: activeChild?.interests,
      });
    } finally {
      setBusy(false);
    }
  };

  const { listening, supported, toggle: toggleVoice } = useVoicePrompt({
    onFinal: (text) => {
      if (inputRef.current) inputRef.current.value = text;
      setTimeout(() => {
        const v = inputRef.current?.value || '';
        if (v.trim()) submit(v);
      }, 800);
    },
  });

  const onSave = () => {
    const book = saveCurrentBook();
    if (book) {
      setLastBookId(book.id);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2400);
    }
  };

  const onSaveUnused = () => {
    if (!pages.length) return;
    // Save the last page's image as the world preview
    const last = pages[pages.length - 1];
    const book = saveCurrentBook();
    if (book) {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2400);
    }
  };

  const onShare = async () => {
    if (generatingStory || !pages.length) return;
    try {
      setGeneratingStory(true);
      setStoryUrl(null);
      // Use the first page's image as the video backdrop, first page's title as the label
      const first = pages[0];
      if (!first.image) return;
      const blob = await (await fetch(first.image)).blob();
      const dataUrl = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
      const summary = pages.map((p) => p.title).join(' · ').slice(0, 80);
      const res = await fetch(API + '/api/story/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: dataUrl, title: first.title || 'My Book', subtitle: summary, durationSec: 6 }),
      });
      const j = await res.json();
      if (j.url) setStoryUrl(j.url);
    } catch (e) {
      console.error('share failed', e);
    } finally {
      setGeneratingStory(false);
    }
  };

  const warm = mood.primary;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0812', overflow: 'hidden' }}>
      <BookView />

      {/* Top status chip */}
      <div style={{
        position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px',
        borderRadius: 30, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)',
        border: '1px solid ' + warm + '44', color: warm, fontSize: 13, fontWeight: 700,
        zIndex: 15, maxWidth: '90vw',
      }}>
        <Sparkles size={14} />
        {busy ? 'Writing your page…' : (pages.length ? pages.length + ' page' + (pages.length === 1 ? '' : 's') + ' so far' : 'Ready when you are!')}
      </div>

      {stickers.length > 0 && (
        <div style={{
          position: 'absolute', top: 18, left: 18, zIndex: 15,
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)',
          border: '1px solid ' + warm + '55',
        }}>
          <Award size={14} color={warm} />
          <span style={{ color: warm, fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>
            {stickers.length} {stickers.length === 1 ? 'sticker' : 'stickers'}
          </span>
          <div style={{ display: 'flex', gap: 2, maxWidth: 120, overflow: 'hidden' }}>
            {stickers.slice(-6).map((s2, i) => (
              <span key={i} style={{ fontSize: 16 }}>{s2.emoji}</span>
            ))}
          </div>
        </div>
      )}

      {/* Right-side controls */}
      <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 15 }}>
        <button onClick={toggleMuted} title={muted ? 'Unmute' : 'Mute'} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid ' + warm + '55', color: warm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button onClick={() => setShowHistory((v) => !v)} title="My books" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid ' + warm + '55', color: warm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <History size={18} />
        </button>
        {pages.length > 0 && (
          <button onClick={onShare} disabled={generatingStory} title="Make a video of this book" style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #25D366, #128C7E)', border: 'none', color: '#fff', cursor: generatingStory ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: generatingStory ? 0.6 : 1 }}>
            <Share2 size={18} />
          </button>
        )}
        {pages.length > 0 && (
          <button onClick={onSave} title="Save this book" style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, ' + warm + ', ' + mood.accent + ')', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Save size={18} />
          </button>
        )}
        {pages.length > 0 && (
          <button onClick={clearPages} title="Start a new book" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Toasts */}
      {generatingStory && (
        <div style={{ position: 'absolute', top: 76, left: 18, padding: '10px 18px', borderRadius: 14, background: 'rgba(37,211,102,0.2)', border: '1px solid #25D366', color: '#25D366', fontSize: 13, fontWeight: 700, zIndex: 20 }}>
          Making a video of your book…
        </div>
      )}
      {storyUrl && (
        <div style={{ position: 'absolute', top: 76, left: 18, padding: '10px 18px', borderRadius: 14, background: 'rgba(37,211,102,0.2)', border: '1px solid #25D366', color: '#25D366', fontSize: 13, fontWeight: 700, zIndex: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          Video ready!
          <a href={storyUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>Open</a>
          <button onClick={() => setStoryUrl(null)} style={{ background: 'transparent', border: 'none', color: '#22c55e', cursor: 'pointer' }}>x</button>
        </div>
      )}
      {savedToast && (
        <div style={{ position: 'absolute', top: 76, right: 18, padding: '10px 18px', borderRadius: 14, background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', color: '#22c55e', fontSize: 13, fontWeight: 700, zIndex: 20 }}>
          Saved!
        </div>
      )}

      {/* Bottom prompt bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(inputRef.current?.value); }}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          bottom: 34, zIndex: 15,
          width: 'min(720px, calc(100% - 32px))',
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '10px 10px 10px 22px',
          background: 'rgba(10,8,18,0.94)', backdropFilter: 'blur(22px)',
          border: '2px solid ' + (listening ? '#ffb700' : warm + '77'),
          borderRadius: 40,
          boxShadow: listening ? '0 0 0 6px rgba(255,183,0,0.15), 0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.6)',
          transition: 'all .25s',
        }}
      >
        <input
          ref={inputRef}
          placeholder={listening ? 'I am listening…' : 'What do you want to make?'}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 17, padding: '12px 0', fontWeight: 500 }}
        />
        <button
          type="button"
          onClick={toggleVoice}
          disabled={!supported || busy}
          title={listening ? 'Stop' : 'Talk to 9jaWonderPal'}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: listening ? 'linear-gradient(135deg,#ffb700,#ff6b00)' : 'linear-gradient(135deg,' + warm + ',' + mood.accent + ')',
            border: 'none', color: listening ? '#fff' : '#000',
            cursor: (supported && !busy) ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: listening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
            boxShadow: listening ? '0 0 24px rgba(255,183,0,0.6)' : 'none',
            opacity: busy ? 0.5 : 1,
            transition: 'all .2s',
          }}
        >
          <Mic size={26} strokeWidth={2.4} />
        </button>
      </form>

      {showHistory && <BooksDrawer onClose={() => setShowHistory(false)} />}

      <style>{`
        @keyframes micPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </div>
  );
}

function BooksDrawer({ onClose, onPlay }) {
  const worlds = useStudioStore((s) => s.worlds);
  const loadBook = useStudioStore((s) => s.loadBook);
  const deleteWorld = useStudioStore((s) => s.deleteWorld);
  const warm = useStudioStore((s) => s.mood.primary);
  const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

  const resolve = (u) => {
    if (!u) return null;
    if (/^https?:\/\//.test(u)) return u;
    if (u.startsWith('/')) return API + u;
    return API + '/' + u;
  };

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(400px, 92vw)', background: 'rgba(10,8,18,0.97)', backdropFilter: 'blur(24px)', borderLeft: '1px solid ' + warm + '44', zIndex: 30, display: 'flex', flexDirection: 'column', animation: 'drawerIn .28s ease' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: warm, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={15} /> My Books ({worlds.length})
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Close</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {worlds.length === 0 && (
          <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>
            Your saved books will appear here. Make something and tap the save button (purple circle).
          </div>
        )}
        {worlds.map((w) => (
          <div key={w.id} style={{ marginBottom: 14, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            {w.preview && <img src={resolve(w.preview)} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 10, display: 'block' }} />}
            <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.4, marginBottom: 4, fontWeight: 700 }}>{w.promptSummary}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>
              {w.pages ? w.pages.length + ' page' + (w.pages.length === 1 ? '' : 's') : ''}
              {w.ts ? ' · ' + new Date(w.ts).toLocaleDateString() : ''}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { loadBook(w.id); onClose(); }} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: warm, color: '#000', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Open</button>
              {w.videoUrl && (
                <button onClick={() => { onPlay(w.videoUrl); onClose(); }} style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Play size={12} /> Video</button>
              )}
              <button onClick={() => deleteWorld(w.id)} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}