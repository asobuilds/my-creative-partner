import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, X } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useAccountStore } from '../../store/accountStore';

const KEY = '9jawonderpal.sessionSeen.v1';

export default function SessionResume() {
  const pages = useStudioStore((s) => s.pages);
  const clearPages = useStudioStore((s) => s.clearPages);
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if: pages exist AND we haven't shown the banner this session
    try {
      const seen = sessionStorage.getItem(KEY);
      if (seen) return;
      if (pages && pages.length > 0) {
        setVisible(true);
        sessionStorage.setItem(KEY, '1');
      }
    } catch (e) {}
  }, [pages.length]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, width: 'min(520px, calc(100% - 32px))',
      padding: 16, borderRadius: 18,
      background: 'linear-gradient(135deg, rgba(255,183,0,0.15), rgba(167,139,250,0.12))',
      border: '1px solid rgba(255,183,0,0.5)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      animation: 'slideDown .35s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#ffb700', letterSpacing: 0.4, marginBottom: 4 }}>
          Welcome back{activeChild ? ', ' + activeChild.name : ''}!
        </div>
        <div style={{ fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5 }}>
          You have {pages.length} page{pages.length === 1 ? '' : 's'} from last time. Continue or start fresh?
        </div>
      </div>
      <button onClick={() => setVisible(false)}
        title="Continue" style={{
          padding: '10px 16px', borderRadius: 12,
          background: 'linear-gradient(135deg, #ffb700, #ff6b00)',
          color: '#000', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        <Play size={13} /> Continue
      </button>
      <button onClick={() => { clearPages(); setVisible(false); }}
        title="Start fresh" style={{
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        <RotateCcw size={12} /> Fresh
      </button>
      <button onClick={() => setVisible(false)}
        title="Dismiss" style={{
          position: 'absolute', top: 8, right: 8,
          background: 'transparent', border: 'none',
          color: '#94a3b8', cursor: 'pointer', padding: 4,
        }}>
        <X size={12} />
      </button>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translate(-50%, -12px) } to { opacity: 1; transform: translate(-50%, 0) } }`}</style>
    </div>
  );
}
