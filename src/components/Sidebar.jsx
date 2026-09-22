import React, { useEffect, useState } from 'react';
import { Sparkles, Home, Box, Lightbulb, Gamepad2, Trophy, MessageSquare, HelpCircle, Settings, User, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

const NAVY = '#0a1f44';
const GOLD = '#ffb700';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onOpenAuth, onOpenSettings, onOpenKidsLogin, collapsed, onToggleCollapse }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile drawer when tab changes
  useEffect(() => { if (isMobile) setMobileOpen(false); }, [activeTab, isMobile]);

  const navItems = [
    { id: 'landing', label: 'Home', icon: <Home size={18} /> },
    { id: 'canvas', label: 'Create', icon: <Box size={18} /> },
    { id: 'games', label: 'Games', icon: <Gamepad2 size={18} /> },
    { id: 'inspiration', label: 'Sparks', icon: <Lightbulb size={18} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} /> },
  ];

  const shown = !isMobile && collapsed;
  const width = isMobile ? 280 : (collapsed ? 76 : 250);

  const content = (
    <div style={{
      width, height: '100%',
      background: 'var(--theme-surface, rgba(10,31,68,0.97))',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: shown ? '20px 8px' : '24px 16px',
      zIndex: 45, flexShrink: 0, boxSizing: 'border-box',
      transition: isMobile ? 'transform .28s cubic-bezier(0.16,1,0.3,1)' : 'width .22s cubic-bezier(0.16,1,0.3,1)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: shown ? 4 : 0, cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
          <div style={{ background: 'linear-gradient(135deg, ' + GOLD + ', #ff6b00)', padding: 10, borderRadius: 14, display: 'flex', flexShrink: 0 }}>
            <Sparkles size={20} color="#fff" />
          </div>
          {!shown && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: GOLD, whiteSpace: 'nowrap' }}>9jaWonderPal</h1>
              <p style={{ margin: 0, fontSize: '0.68rem', opacity: 0.7, whiteSpace: 'nowrap' }}>Imagination Studio</p>
            </div>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}>
              <X size={18} />
            </button>
          )}
        </div>

        {!isMobile && (
          <button onClick={onToggleCollapse} title={collapsed ? 'Open menu' : 'Close menu'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', justifyContent: shown ? 'center' : 'flex-start' }}>
            {shown ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Hide menu</>}
          </button>
        )}

        {!shown && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>{currentUser ? 'Signed in' : 'Guest'}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: GOLD, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser ? currentUser.username : 'Anonymous'}
              </div>
            </div>
            {!currentUser ? (
              <button onClick={onOpenAuth} style={{ background: GOLD, border: 'none', color: '#000', padding: '6px 12px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>Sign In</button>
            ) : (
              <button onClick={() => setActiveTab('profile')} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: GOLD, padding: '6px 10px', borderRadius: 10, fontSize: '0.72rem', cursor: 'pointer' }}>
                <User size={12} />
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button key={nav.id} onClick={() => setActiveTab(nav.id)} title={shown ? nav.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: shown ? '12px 0' : '11px 14px',
                  justifyContent: shown ? 'center' : 'flex-start',
                  borderRadius: 12,
                  border: isActive ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: isActive ? GOLD : '#cbd5e1',
                  cursor: 'pointer', fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}>
                {nav.icon}
                {!shown && <span>{nav.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onOpenKidsLogin} title={shown ? 'Kids Login' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: shown ? '12px 0' : '12px', justifyContent: shown ? 'center' : 'flex-start', background: 'linear-gradient(135deg, rgba(255,183,0,0.15), rgba(255,107,0,0.08))', border: '1px solid rgba(255,183,0,0.4)', color: '#ffb700', borderRadius: 14, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
          <Sparkles size={18} />
          {!shown && <span>Kids Login</span>}
        </button>

        <button onClick={onOpenSettings} title={shown ? 'Settings' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: shown ? '12px 0' : '12px', justifyContent: shown ? 'center' : 'flex-start', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 14, cursor: 'pointer', fontSize: '0.85rem' }}>
          <Settings size={18} />
          {!shown && <span>Settings</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {!mobileOpen && (
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
            style={{ position: 'fixed', top: 14, left: 14, zIndex: 45, width: 44, height: 44, borderRadius: 12,
              background: 'rgba(10,31,68,0.95)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <Menu size={20} />
          </button>
        )}
        {mobileOpen && (
          <>
            <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 44 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 45, animation: 'slideIn .28s cubic-bezier(0.16,1,0.3,1)' }}>
              {content}
            </div>
            <style>{`@keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
          </>
        )}
      </>
    );
  }

  return content;
}
