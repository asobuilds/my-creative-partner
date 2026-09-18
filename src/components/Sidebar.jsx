import React from 'react';
import { Sparkles, Home, Box, Lightbulb, Trophy, MessageSquare, HelpCircle, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react';

const NAVY = '#0a1f44';
const GOLD = '#f59e0b';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onOpenAuth, onOpenSettings, collapsed, onToggleCollapse }) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: <Home size={18} /> },
    { id: 'canvas', label: 'Create', icon: <Box size={18} /> },
    { id: 'inspiration', label: 'Sparks', icon: <Lightbulb size={18} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} /> },
  ];

  const width = collapsed ? 76 : 250;

  return (
    <div style={{
      width, height: '100%',
      background: 'var(--theme-surface)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: collapsed ? '20px 8px' : '24px 16px',
      zIndex: 30, flexShrink: 0, boxSizing: 'border-box',
      transition: 'width .22s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', paddingLeft: collapsed ? 4 : 0 }} onClick={() => setActiveTab('landing')}>
          <div style={{ background: 'linear-gradient(135deg, ' + GOLD + ', #ff6b00)', padding: 10, borderRadius: 14, display: 'flex', flexShrink: 0 }}>
            <Sparkles size={20} color="#fff" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: GOLD, whiteSpace: 'nowrap' }}>9jaWonderPal</h1>
              <p style={{ margin: 0, fontSize: '0.68rem', opacity: 0.7, whiteSpace: 'nowrap' }}>Imagination Studio</p>
            </div>
          )}
        </div>

        <button onClick={onToggleCollapse} title={collapsed ? 'Open menu' : 'Close menu'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Hide menu</>}
        </button>

        {!collapsed && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>{currentUser ? 'Signed in' : 'Guest'}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: GOLD, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser ? currentUser.username : 'Anonymous'}</div>
            </div>
            {!currentUser ? (
              <button onClick={onOpenAuth} style={{ background: GOLD, border: 'none', color: '#000', padding: '6px 12px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>Sign In</button>
            ) : (
              <button onClick={() => setActiveTab('profile')} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: GOLD, padding: '6px 10px', borderRadius: 10, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} />
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button key={nav.id} onClick={() => setActiveTab(nav.id)}
                title={collapsed ? nav.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '12px 0' : '11px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 12,
                  border: isActive ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: isActive ? GOLD : '#cbd5e1',
                  cursor: 'pointer', fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}>
                {nav.icon}
                {!collapsed && <span>{nav.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onOpenSettings} title={collapsed ? 'Settings' : undefined}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '12px 0' : '12px', justifyContent: collapsed ? 'center' : 'flex-start', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 14, cursor: 'pointer', fontSize: '0.85rem' }}>
        <Settings size={18} />
        {!collapsed && <span>Settings</span>}
      </button>
    </div>
  );
}
