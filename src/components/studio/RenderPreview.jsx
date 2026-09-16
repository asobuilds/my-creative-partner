import React, { useState } from 'react';
import { Image as ImageIcon, X, Download } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useResponsive } from '../../hooks/useResponsive';

export default function RenderPreview() {
  const lastRender = useStudioStore((s) => s.lastRender);
  const mood = useStudioStore((s) => s.mood);
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(true);
  const [full, setFull] = useState(false);

  if (!lastRender || !lastRender.preview || !open) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: isMobile ? 12 : 'auto',
          right: isMobile ? 12 : 24,
          top: 60,
          zIndex: 18,
          width: isMobile ? 130 : 200,
          padding: 8,
          background: 'rgba(9,13,22,0.88)',
          backdropFilter: 'blur(18px)',
          border: '1px solid ' + mood.primary + '55',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          animation: 'renderIn .4s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <ImageIcon size={12} color={mood.primary} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: mood.primary, textTransform: 'uppercase', flex: 1 }}>
            Blender
          </span>
          <button
            onClick={() => setFull(true)}
            title="Expand"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <ImageIcon size={11} />
          </button>
          <button
            onClick={() => setOpen(false)}
            title="Hide"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <X size={11} />
          </button>
        </div>
        <img
          src={lastRender.preview}
          alt="Blender render"
          onClick={() => setFull(true)}
          style={{ width: '100%', borderRadius: 8, display: 'block', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
        />
      </div>

      {full && (
        <div
          onClick={() => setFull(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out',
          }}
        >
          <img
            src={lastRender.preview}
            alt="Blender render full"
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,240,255,0.3)' }}
          />
          <a
            href={lastRender.preview}
            download={'synthetix-' + Date.now() + '.png'}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 24, right: 24,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, ' + mood.primary + ', ' + mood.accent + ')',
              color: '#000', fontWeight: 700, fontSize: 12, textDecoration: 'none',
            }}
          >
            <Download size={13} /> Save PNG
          </a>
        </div>
      )}

      <style>{`
        @keyframes renderIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
