import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Wand2, Share2, Square, Check } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useVoicePrompt } from '../../hooks/useVoicePrompt';

const PHASE_LABEL = {
  idle: 'Ready',
  planning: 'Planning graph...',
  streaming: 'Refining prompt...',
  materializing: 'Generating mesh...',
  reflecting: 'Reflecting...',
  done: 'Done',
};

export default function HUD({ compact = false, engine, cancel, streamStatus }) {
  const promptInput = useStudioStore((s) => s.promptInput);
  const setPromptInput = useStudioStore((s) => s.setPromptInput);
  const phase = useStudioStore((s) => s.phase);
  const mood = useStudioStore((s) => s.mood);
  const { isMobile } = useResponsive();

  const submit = () => {
    const text = useStudioStore.getState().promptInput;
    if (!text || !text.trim()) return;
    engine.submit(text, { source: 'text' });
    clearCaptured();
  };

  const { listening, supported, toggle: toggleVoice, lastCaptured, clearCaptured, autoSubmit } = useVoicePrompt({
    onFinal: (text) => { if (autoSubmit) engine.submit(text, { source: 'voice' }); },
  });

  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    if (listening || !lastCaptured) { setHintVisible(false); return; }
    setHintVisible(true);
    const t = setTimeout(() => setHintVisible(false), 4200);
    return () => clearTimeout(t);
  }, [listening, lastCaptured]);

  const inputRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.target !== inputRef.current) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
      if (e.key === 'Escape') { e.preventDefault(); if (cancel) cancel(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const busy = phase !== 'idle' && phase !== 'done';

  return (
    <>
      <div style={{
        position: 'absolute', top: 14, left: 14, zIndex: 12,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 12,
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(14px)',
        border: '1px solid ' + mood.primary + '55',
        fontSize: 11, color: mood.primary, fontWeight: 700, letterSpacing: 0.4,
      }}>
        <Wand2 size={13} />
        {PHASE_LABEL[phase] || streamStatus}
      </div>

      <button
        onClick={() => {
          const c = document.querySelector('canvas'); if (!c) return;
          const a = document.createElement('a');
          a.download = 'synthetix-' + Date.now() + '.png';
          a.href = c.toDataURL('image/png');
          a.click();
        }}
        style={{
          position: 'absolute', top: 14, right: 14, zIndex: 12,
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 12,
          background: 'linear-gradient(135deg,#25D366,#128C7E)',
          border: 'none', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer',
        }}
      >
        <Share2 size={13} /> {isMobile ? 'Story' : 'Post 24h Story'}
      </button>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          bottom: compact ? 78 : 26, zIndex: 15,
          width: compact ? 'calc(100% - 24px)' : 'min(620px, 62vw)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'stretch',
          padding: '6px 6px 6px 16px',
          background: 'rgba(15,23,42,0.94)', backdropFilter: 'blur(20px)',
          border: '1px solid ' + (listening ? '#ff4757' : mood.primary + '66'),
          borderRadius: 30,
          boxShadow: listening
            ? '0 0 0 3px rgba(255,71,87,0.18), 0 12px 44px rgba(0,0,0,0.5)'
            : '0 12px 44px rgba(0,0,0,0.5)',
          transition: 'border-color .2s, box-shadow .2s',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={promptInput}
            onChange={(e) => { setPromptInput(e.target.value); if (lastCaptured) clearCaptured(); }}
            placeholder={listening ? 'Listening... speak now' : (isMobile ? 'Imagine...' : 'Type or speak a spatial prompt...')}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 13, padding: '8px 0',
            }}
          />
          <button
            type="button"
            onClick={toggleVoice}
            disabled={!supported}
            title={supported ? (listening ? 'Stop voice' : 'Start voice') : 'Voice not supported'}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: listening ? '#ff4757' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', cursor: supported ? 'pointer' : 'not-allowed',
              opacity: supported ? 1 : 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
            }}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          {busy ? (
            <button
              type="button"
              onClick={() => { if (cancel) cancel(); }}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              type="submit"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, ' + mood.primary + ', ' + mood.accent + ')',
                border: 'none', color: '#000', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          )}
        </div>

        {hintVisible && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 4px 4px',
            fontSize: 10.5, color: mood.primary, letterSpacing: 0.3,
            borderTop: '1px dashed ' + mood.primary + '33',
            marginTop: 6,
            animation: 'voiceHint .25s ease-out',
          }}>
            <Check size={12} />
            Voice captured — edit above or press Enter to send
          </div>
        )}
      </form>

      <style>{`
        @keyframes voiceHint { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
