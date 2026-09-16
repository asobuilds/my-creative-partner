import React from 'react';
import { Sparkles, Home, Box, Lightbulb, Trophy, MessageSquare, HelpCircle, Settings, User } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onOpenAuth, onOpenSettings }) {
  const navItems = [
    { id: 'landing', label: 'Overview & Guide', icon: <Home size={18} /> },
    { id: 'canvas', label: 'Create', icon: <Box size={18} /> },
    { id: 'inspiration', label: 'Idea Stream', icon: <Lightbulb size={18} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} /> }
  ];

  return (
    <div style={{
      width: '250px',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.12)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      zIndex: 30,
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
          <div style={{ background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#00f0ff' }}>WonderPal</h1>
            <p style={{ margin: 0, fontSize: '0.68rem', opacity: 0.7 }}>Imagination Studio</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>{currentUser ? 'Logged In' : 'Guest Account'}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f0ff' }}>{currentUser ? currentUser.username : 'Anonymous'}</div>
          </div>
          {!currentUser ? (
            <button onClick={onOpenAuth} style={{ background: 'linear-gradient(135deg, #3b82f6, #00f0ff)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
              Sign In
            </button>
          ) : (
            <button onClick={() => setActiveTab('profile')} style={{ background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.4)', color: '#00f0ff', padding: '6px 10px', borderRadius: '10px', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} /> Profile
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  color: isActive ? '#00f0ff' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                {nav.icon} {nav.label}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onOpenSettings} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: '14px', cursor: 'pointer', fontSize: '0.85rem' }}>
        <Settings size={18} /> Settings
      </button>
    </div>
  );
}