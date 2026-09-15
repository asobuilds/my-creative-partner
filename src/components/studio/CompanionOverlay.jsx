import React, { useEffect, useState } from 'react';
import { Sparkles, X, Volume2, VolumeX, RotateCw } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useCompanionVoice } from '../../hooks/useCompanionVoice';

export default function CompanionOverlay() {
  const companion = useStudioStore((s) => s.companion);
  const dismiss = useStudioStore((s) => s.companionDismiss);
  const muted = useStudioStore((s) => s.voiceMuted);
  const toggleMuted = useStudioStore((s) => s.toggleVoiceMuted);
  const mood = useStudioStore((s) => s.mood);
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const { replay, stop } = useCompanionVoice();

  useEffect(() => { if (companion.visible) setOpen(true); }, [companion.visible]);

  const handleMuteToggle = () => {
    toggleMuted();
    if (!muted) stop();
  };

  if (!open || !companion.visible) return null;

  const btn = (icon, onClick, title) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 24, height: 24, borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#cbd5e1', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0,
      }}
    >
      {icon}
    </button>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: isMobile ? 12 : 'auto',
        right: isMobile ? 12 : 24,
        bottom: isMobile ? 168 : 108,
        zIndex: 20,
        maxWidth: isMobile ? '100%' : 380,
        padding: '14px 16px 14px 18px',
        background: 'rgba(9,13,22,0.88)',
        backdropFilter: 'blur(22px)',
        border: '1px solid ' + mood.primary + '55',
        borderRadius: 18,
        boxShadow: '0 12px 44px rgba(0,0,0,0.55), 0 0 0 1px ' + mood.primary + '22 inset',
        color: '#e2e8f0',
        fontSize: 13,
        lineHeight: 1.5,
        animation: 'companionIn .32s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Sparkles size={14} color={mood.primary} />
        <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.6, color: mood.primary, textTransform: 'uppercase' }}>
          Companion
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {btn(<RotateCw size={12} />, replay, 'Replay voice')}
          {btn(muted ? <VolumeX size={12} /> : <Volume2 size={12} />, handleMuteToggle, muted ? 'Unmute' : 'Mute')}
          {btn(<X size={12} />, () => { setOpen(false); dismiss(); }, 'Close')}
        </div>
      </div>
      <div style={{ fontStyle: 'italic', opacity: companion.streaming ? 0.85 : 1 }}>
        &ldquo;{companion.text}
        {companion.streaming && <span className="caret">&#9611;</span>}&rdquo;
      </div>
      <style>{`
        @keyframes companionIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .caret { display: inline-block; animation: blink 1s steps(2, start) infinite; margin-left: 2px; }
        @keyframes blink { to { visibility: hidden; } }
      `}</style>
    </div>
  );
}
