import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Gamepad2, Trophy, Mic, Plus, Clock, Star, Flame } from 'lucide-react';
import { useAccountStore } from '../store/accountStore';
import { useStudioStore } from '../store/studioStore';
import { useGamificationStore } from '../store/gamificationStore';
import WonderBackground from './Background/WonderBackground';
import MascotGuide from './Guides/MascotGuide';

/**
 * KidHome — the child's own home screen.
 * Big, colorful, icon-first. No walls of text.
 */

function BigButton({ emoji, label, color, onClick, size = 'large' }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 10,
        padding: size === 'large' ? '28px 20px' : '20px 16px',
        minHeight: size === 'large' ? 160 : 120,
        borderRadius: 28,
        background: 'linear-gradient(160deg, ' + color + ', ' + color + 'cc)',
        border: '4px solid rgba(255,255,255,0.85)',
        boxShadow: pressed
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 12px 32px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transform: pressed ? 'translateY(3px) scale(0.98)' : 'translateY(0) scale(1)',
        transition: 'all 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <div style={{ fontSize: size === 'large' ? 56 : 40, lineHeight: 1 }}>{emoji}</div>
      <div style={{
        fontSize: size === 'large' ? 17 : 14,
        fontWeight: 900,
        color: '#fff',
        letterSpacing: 0.3,
        textShadow: '0 2px 6px rgba(0,0,0,0.25)',
      }}>
        {label}
      </div>
    </button>
  );
}

function SmallCard({ emoji, label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 18,
      background: 'rgba(255,255,255,0.85)',
      border: '2px solid rgba(255,255,255,0.5)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      minWidth: 120, flex: 1,
    }}>
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: color }}>{value}</div>
      </div>
    </div>
  );
}

export default function KidHome({ onNavigate }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const pages = useStudioStore((s) => s.pages);
  const getChildStats = useGamificationStore((s) => s.getChildStats);
  const [greeting, setGreeting] = useState('Hello');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    // Show welcome guide once per session
    const key = 'kidhome-welcome-' + (activeChild?.id || 'guest');
    try {
      if (!sessionStorage.getItem(key)) {
        const t = setTimeout(() => setShowWelcome(true), 900);
        sessionStorage.setItem(key, '1');
        return () => clearTimeout(t);
      }
    } catch (e) {}
  }, [activeChild]);

  const stats = activeChild ? getChildStats(activeChild.id) : { points: 0, streak: 0, badges: [] };
  const lastPage = pages.length ? pages[pages.length - 1] : null;

  const go = (tab) => {
    if (onNavigate) onNavigate(tab);
  };

  return (
    <WonderBackground variant="create">
      <div style={{ minHeight: '100vh', padding: '32px 20px 100px', position: 'relative' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>

          {/* Greeting */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 72, marginBottom: 8, display: 'inline-block', animation: 'kidWelcome 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              {activeChild?.avatar || '🌟'}
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#0a1f44', margin: '0 0 6px', letterSpacing: -0.6 }}>
              {greeting}{activeChild ? ', ' + activeChild.name : ''}!
            </h1>
            <p style={{ fontSize: 15, color: '#475569', margin: 0, fontWeight: 600 }}>
              What would you like to do today?
            </p>
          </div>

          {/* Quick stats */}
          {activeChild && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <SmallCard emoji="⭐" label="Points" value={stats.points} color="#f59e0b" />
              <SmallCard emoji="🔥" label="Streak" value={stats.streak + ' days'} color="#ef4444" />
              <SmallCard emoji="🏅" label="Badges" value={stats.badges.length} color="#a78bfa" />
            </div>
          )}

          {/* Main big buttons — 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            <BigButton emoji="🎤" label="Make Something" color="#ffb700" onClick={() => go('canvas')} />
            <BigButton emoji="🎮" label="Play Games" color="#22d3ee" onClick={() => go('games')} />
            <BigButton emoji="📚" label="My Books" color="#a78bfa" onClick={() => go('canvas')} />
            <BigButton emoji="💡" label="Sparks" color="#f472b6" onClick={() => go('inspiration')} />
          </div>

          {/* Extra row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            <BigButton emoji="🏆" label="Leaderboard" color="#10b981" onClick={() => go('leaderboard')} size="small" />
            <BigButton emoji="✏️" label="Homework Helper" color="#8b5cf6" onClick={() => go('canvas')} size="small" />
          </div>

          {/* Latest page preview */}
          {lastPage && (
            <div style={{ background: 'rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 24, padding: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {lastPage.image && (
                <img
                  src={lastPage.image.startsWith('http') ? lastPage.image : ((import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '') + lastPage.image)}
                  alt={lastPage.title}
                  style={{ width: 90, height: 90, borderRadius: 18, objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Your latest page</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0a1f44', marginBottom: 4 }}>{lastPage.title}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lastPage.story}</div>
              </div>
              <button onClick={() => go('canvas')}
                style={{ padding: '12px 20px', borderRadius: 14, background: 'linear-gradient(135deg, #ffb700, #ff6b00)', color: '#000', border: 'none', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>
                See it →
              </button>
            </div>
          )}
        </div>
      </div>

      {showWelcome && (
        <MascotGuide
          mascot="ijapa"
          message={'Hi ' + (activeChild?.name || 'friend') + '! I am Ìjàpá. Tap any button to start. Have fun!'}
          position="bottom-right"
          onDismiss={() => setShowWelcome(false)}
        />
      )}

      <style>{`
        @keyframes kidWelcome {
          from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          60% { transform: scale(1.1) rotate(3deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>
    </WonderBackground>
  );
}
