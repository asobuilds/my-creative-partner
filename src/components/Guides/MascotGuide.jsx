import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MASCOTS } from './mascots';
import { tap as sTap } from '../../engine/sound';

/**
 * MascotGuide — a friendly character with a speech bubble.
 *
 * Props:
 *   mascot    — 'ijapa' | 'star' | 'drum'          (default: 'ijapa')
 *   message   — text to display in the bubble
 *   position  — 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
 *   size      — mascot size in pixels              (default: 90)
 *   mood      — 'happy' | 'sad' | 'neutral'        (default: 'happy')
 *   arrow     — css position for the pointing arrow (optional)
 *   action    — { label, onClick } optional button
 *   autoHide  — ms to auto-hide the bubble         (default: 0 = never)
 *   onDismiss — callback when closed
 */
export default function MascotGuide({
  mascot = 'ijapa',
  message,
  position = 'bottom-right',
  size = 90,
  mood = 'happy',
  action,
  autoHide = 0,
  onDismiss,
  children,
}) {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (autoHide > 0) {
      const t = setTimeout(() => { setVisible(false); setTimeout(() => onDismiss && onDismiss(), 300); }, autoHide);
      return () => clearTimeout(t);
    }
  }, [autoHide, onDismiss]);

  if (!visible || dismissed) return null;

  const Mascot = MASCOTS[mascot] || MASCOTS.ijapa;

  const posStyle = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 90, right: 24 },
    'top-left': { top: 90, left: 24 },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  }[position] || { bottom: 24, right: 24 };

  const close = () => {
    try { sTap(); } catch (e) {}
    setVisible(false);
    setTimeout(() => { setDismissed(true); onDismiss && onDismiss(); }, 300);
  };

  const bubbleOnLeft = position === 'bottom-right' || position === 'top-right';

  return (
    <div
      style={{
        position: 'fixed',
        ...posStyle,
        zIndex: 300,
        display: 'flex',
        flexDirection: bubbleOnLeft ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 12,
        maxWidth: 'min(440px, calc(100vw - 32px))',
        pointerEvents: 'none',
        animation: 'guideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Mascot */}
      <div
        style={{
          flexShrink: 0,
          animation: 'guideFloat 3s ease-in-out infinite',
          filter: 'drop-shadow(0 8px 24px rgba(255,183,0,0.35))',
        }}
      >
        <Mascot size={size} mood={mood} />
      </div>

      {/* Bubble */}
      <div
        style={{
          position: 'relative',
          background: '#ffffff',
          border: '2px solid #ffb700',
          borderRadius: 20,
          padding: '14px 18px',
          boxShadow: '0 12px 40px rgba(255,183,0,0.25)',
          pointerEvents: 'auto',
          maxWidth: 340,
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          style={{
            position: 'absolute', top: 6, right: 6,
            background: 'transparent', border: 'none',
            color: '#94a3b8', cursor: 'pointer', padding: 4,
          }}
        >
          <X size={14} />
        </button>

        <div style={{
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.55,
          color: '#0a1f44',
          paddingRight: 12,
        }}>
          {message}
        </div>

        {action && (
          <button
            onClick={() => { try { sTap(); } catch (e) {} action.onClick && action.onClick(); }}
            style={{
              marginTop: 10,
              padding: '8px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #ffb700, #ff6b00)',
              color: '#000',
              border: 'none',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )}

        {children}
      </div>

      <style>{`
        @keyframes guideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes guideFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
