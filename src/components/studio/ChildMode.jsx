import React, { useEffect, useRef, useState } from 'react';
import SpatialViewport from './SpatialViewport';
import CompanionOverlay from './CompanionOverlay';
import { useStudioStore } from '../../store/studioStore';
import { useVoicePrompt } from '../../hooks/useVoicePrompt';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import { startMoodSync } from '../../engine/moodEngine';
import { Mic, Sparkles, Save, RotateCcw, Volume2, VolumeX, History, ChevronDown } from 'lucide-react';

const PHASE_TEXT = {
  idle: 'Ready when you are!',
  planning: 'Thinking about your idea…',
  streaming: 'Getting excited…',
  rendering: 'Building your world…',
  reflecting: 'WonderPal is thinking of a question…',
  done: 'Done! Look what you made.',
};

export default function ChildMode() {
  const [engineReady, setEngineReady] = useState(false);
  const { engine, cancel } = usePromptEngine();
  const streamStatus = useStudioStore((s) => s.streamStatus);
  const phase = useStudioStore((s) => s.phase);
  const mood = useStudioStore((s) => s.mood);
  const muted = useStudioStore((s) => s.voiceMuted);
  const toggleMuted = useStudioStore((s) => s.toggleVoiceMuted);
  const saveCurrentWorld = useStudioStore((s) => s.saveCurrentWorld);
  const lastRender = useStudioStore((s) => s.lastRender);
  const objectCount = useStudioStore((s) => s.sceneObjects.length);
  const history = useStudioStore((s) => s.sceneHistory);
  const clearScene = useStudioStore((s) => s.clearScene);
  const [savedToast, setSavedToast] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { startMoodSync(); setEngineReady(true); }, []);

  const submit = (text) => {
    const clean = (text || '').trim();
    if (!clean) return;
    engine.submit(clean, { source: 'child' });
    if (inputRef.current) inputRef.current.value = '';
  };

  const { listening, supported, toggle: toggleVoice } = useVoicePrompt({
    onFinal: (text) => {
      if (inputRef.current) inputRef.current.value = text;
      // Auto-submit after a short pause so the child sees their words first
      setTimeout(() => {
        const v = inputRef.current?.value || '';
        if (v.trim()) submit(v);
      }, 800);
    },
  });

  const onSave = () => {
    if (!objectCount) return;
    const world = saveCurrentWorld(
      lastRender?.preview ? lastRender.preview.replace(/^https?:\/\/[^/]+/, '') : null,
      history.join(' → ')
    );
    if (world) { setSavedToast(true); setTimeout(() => setSavedToast(false), 2400); }
  };

  const busy = phase !== 'idle' && phase !== 'done';
  const warm = mood.primary;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0812', overflow: 'hidden' }}>
      <SpatialViewport className="viewport" />
      <CompanionOverlay />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px', borderRadius: 30, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid ' + warm + '44', color: warm, fontSize: 13, fontWeight: 700, zIndex: 15 }}>
        <Sparkles size={14} /> {PHASE_TEXT[phase] || 'Ready'}
      </div>

      {/* Right-side controls */}
      <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 15 }}>
        <button onClick={toggleMuted} title={muted ? 'Unmute' : 'Mute'} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid ' + warm + '55', color: warm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button onClick={() => setShowHistory((v) => !v)} title="Your worlds" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid ' + warm + '55', color: warm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <History size={18} />
        </button>
        {objectCount > 0 && (
          <button onClick={onSave} title="Save this world" style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, ' + warm + ', ' + mood.accent + ')', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Save size={18} />
          </button>
        )}
        {objectCount > 0 && (
          <button onClick={() => clearScene()} title="Start a new world" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Saved toast */}
      {savedToast && (
        <div style={{ position: 'absolute', top: 76, right: 18, padding: '10px 18px', borderRadius: 14, background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', color: '#22c55e', fontSize: 13, fontWeight: 700, animation: 'toastIn .3s ease' }}>
          Saved to your worlds!
        </div>
      )}

      {/* Big bottom prompt bar */}
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
          placeholder={listening ? 'I\'m listening…' : 'What do you want to make?'}
          autoComplete="off"
          spellCheck={false}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 17, padding: '12px 0', fontWeight: 500 }}
        />
        <button
          type="button"
          onClick={toggleVoice}
          disabled={!supported}
          title={listening ? 'Stop' : 'Talk to WonderPal'}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: listening ? 'linear-gradient(135deg,#ffb700,#ff6b00)' : 'linear-gradient(135deg,' + warm + ',' + mood.accent + ')',
            border: 'none', color: listening ? '#fff' : '#000', cursor: supported ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: listening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
            boxShadow: listening ? '0 0 24px rgba(255,183,0,0.6)' : 'none',
            transition: 'all .2s',
          }}
        >
          <Mic size={26} strokeWidth={2.4} />
        </button>
      </form>

      {/* Worlds drawer */}
      {showHistory && <WorldsDrawer onClose={() => setShowHistory(false)} />}

      <style>{`
        @keyframes micPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function WorldsDrawer({ onClose }) {
  const worlds = useStudioStore((s) => s.worlds);
  const loadWorld = useStudioStore((s) => s.loadWorld);
  const deleteWorld = useStudioStore((s) => s.deleteWorld);
  const warm = useStudioStore((s) => s.mood.primary);

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(360px, 92vw)', background: 'rgba(10,8,18,0.97)', backdropFilter: 'blur(24px)', borderLeft: '1px solid ' + warm + '44', zIndex: 30, display: 'flex', flexDirection: 'column', animation: 'drawerIn .28s ease' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: warm, fontWeight: 800, fontSize: 15 }}>My Worlds</div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Close</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {worlds.length === 0 && (
          <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>
            Your saved worlds will appear here. Make something and tap the save button.
          </div>
        )}
        {worlds.map((w) => (
          <div key={w.id} style={{ marginBottom: 14, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            {w.preview && (
              <img src={w.preview} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 10, display: 'block' }} />
            )}
            <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.4, marginBottom: 8 }}>{w.promptSummary}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { loadWorld(w.id); onClose(); }} style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: warm, color: '#000', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Load</button>
              <button onClick={() => deleteWorld(w.id)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', fontSize: 11, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}
