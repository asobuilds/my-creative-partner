import React, { useEffect, useState } from 'react';
import { Sparkles, Flame, Award } from 'lucide-react';
import { badgeByKey } from '../../engine/badges';

const CONFETTI_COLORS = ['#ffb700', '#ff6b00', '#22d3ee', '#a78bfa', '#f472b6', '#4ade80'];

function confettiPieces(n = 50) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random() * 1.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotate: Math.random() * 360,
    });
  }
  return arr;
}

export default function Celebration() {
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [badgePopup, setBadgePopup] = useState(null);

  useEffect(() => {
    const onPoints = (e) => {
      const detail = e.detail;
      if (!detail) return;
      setToast({ points: detail.pointsEarned, streak: detail.streak, total: detail.totalPoints });
      setConfetti(confettiPieces(40));
      setTimeout(() => { setToast(null); setConfetti([]); }, 2600);
      if (detail.newlyEarned && detail.newlyEarned.length) {
        setTimeout(() => {
          setBadgePopup(badgeByKey(detail.newlyEarned[0]));
          setTimeout(() => setBadgePopup(null), 4000);
        }, 800);
      }
    };
    window.addEventListener('wonderpal:points-earned', onPoints);
    return () => window.removeEventListener('wonderpal:points-earned', onPoints);
  }, []);

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,183,0,0.95), rgba(255,107,0,0.95))', boxShadow: '0 20px 60px rgba(255,183,0,0.4)', color: '#000', fontWeight: 800 }}>
            <Sparkles size={22} />
            <div>
              <div style={{ fontSize: 18, lineHeight: 1 }}>+{toast.points} points</div>
              {toast.streak > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 4, opacity: 0.85 }}>
                  <Flame size={12} /> {toast.streak}-day streak · {toast.total} total
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {confetti.map((p) => (
        <div key={p.id} style={{
          position: 'fixed', top: 0, left: p.left + '%',
          width: 10, height: 14, background: p.color, borderRadius: 2,
          zIndex: 9998, pointerEvents: 'none',
          animation: 'confettiFall ' + p.duration + 's linear ' + p.delay + 's forwards',
        }} />
      ))}

      {badgePopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ maxWidth: 400, width: '100%', background: 'linear-gradient(135deg, rgba(255,183,0,0.15), rgba(167,139,250,0.15))', border: '2px solid #ffb700', borderRadius: 28, padding: 40, textAlign: 'center', boxShadow: '0 30px 90px rgba(255,183,0,0.5)' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>{badgePopup.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#ffb700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              <Award size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Badge unlocked
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{badgePopup.name}</div>
            <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>{badgePopup.desc}</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall { from { transform: translateY(-20px) rotate(0deg); opacity: 1; } to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      `}</style>
    </>
  );
}
