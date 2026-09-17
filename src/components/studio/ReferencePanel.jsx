import React from 'react';
import { Camera, Sparkles, X } from 'lucide-react';

export default function ReferencePanel({ data, loading, onDismiss, mood, prompt }) {
  if (!data && !loading) return null;
  const m = mood || { primary: '#ffb700', accent: '#7c3aed' };

  return (
    <div style={{
      position: 'absolute',
      right: 18, top: 76,
      width: 'min(320px, 44vw)',
      background: 'rgba(10,8,18,0.92)',
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
        <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#0a0812' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.primary, fontSize: 12 }}>
            <span style={{ animation: 'pulse 1.2s ease-in-out infinite' }}>Looking it up…</span>
          </div>
        )}
        {!loading && data && data.thumb && (
          <img src={data.thumb} alt={prompt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {!loading && data && !data.thumb && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 11, padding: 16, textAlign: 'center' }}>
            No reference photo found for "{prompt}"
          </div>
        )}
        {data && data.ai && (
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: 'rgba(10,8,18,0.85)', color: m.primary, fontSize: 9, fontWeight: 800, letterSpacing: 0.6 }}>
            <Sparkles size={10} /> AI IMAGE
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px', fontSize: 11.5, lineHeight: 1.5, color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: m.primary, fontWeight: 700 }}>Your imagining</span> — made of shapes and light.{' '}
        <span style={{ color: m.primary, fontWeight: 700 }}>The real thing</span> — made of leaves, feathers, and time.{' '}
        <em style={{ color: '#94a3b8' }}>Both are yours.</em>
      </div>

      <style>{`
        @keyframes refIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
