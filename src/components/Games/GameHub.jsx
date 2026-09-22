import React, { useState } from 'react';
import { Gamepad2, Lock } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { gamesForAge } from '../../engine/games';

const GOLD = '#ffb700';

export default function GameHub({ onLaunchGame }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const [picked, setPicked] = useState(null);

  const available = activeChild ? gamesForAge(activeChild.age) : [];
  const allowed = new Set(activeChild && activeChild.allowedGames ? activeChild.allowedGames : available.map((g) => g.key));
  const shown = available.filter((g) => allowed.has(g.key));

  const launch = (game) => {
    setPicked(game.key);
    if (onLaunchGame) onLaunchGame(game.key);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: GOLD, marginBottom: 16 }}>
            <Gamepad2 size={26} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: -0.5 }}>Games</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            {activeChild ? 'Games picked for ' + activeChild.name + ' (age ' + activeChild.age + ')' : 'Register a child first to see games fit for their age.'}
          </p>
        </div>

        {shown.length === 0 && activeChild && (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 }}>
            <Lock size={28} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div style={{ fontSize: 14 }}>Your parent has not enabled any games yet.</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {shown.map((g) => (
            <button key={g.key} onClick={() => launch(g)}
              style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid ' + g.color + '44', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', minHeight: 160, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{g.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{g.name}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, flex: 1 }}>{g.desc}</div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: g.color, fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>
                Play →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
