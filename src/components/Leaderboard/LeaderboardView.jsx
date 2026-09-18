import React, { useMemo } from 'react';
import { Trophy, Flame, Award } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { levelFor, badgeByKey } from '../../engine/badges';

const GOLD = '#f59e0b';

export default function LeaderboardView() {
  const children = useAccountStore((s) => s.children);
  const activeChildId = useAccountStore((s) => s.activeChildId);
  const points = useGamificationStore((s) => s.points);
  const streaks = useGamificationStore((s) => s.streaks);
  const earnedBadges = useGamificationStore((s) => s.earnedBadges);

  const ranked = useMemo(() => {
    return children
      .map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        culture: c.culture,
        points: points[c.id] || 0,
        streak: streaks[c.id] || 0,
        badges: earnedBadges[c.id] || [],
        level: levelFor(points[c.id] || 0),
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
  }, [children, points, streaks, earnedBadges]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: GOLD, marginBottom: 16 }}>
            <Trophy size={26} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: -0.5 }}>Leaderboard</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            Every page earns points. Every streak earns badges. The more they make, the higher they climb.
          </p>
        </div>

        {ranked.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b', fontSize: 14 }}>
            No children registered yet. A parent needs to add children first.
          </div>
        )}

        {ranked.map((c, i) => {
          const isMe = c.id === activeChildId;
          const rankStyles = [
            { bg: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(255,107,0,0.08))', border: GOLD, badge: '🥇' },
            { bg: 'linear-gradient(135deg, rgba(192,192,192,0.18), rgba(148,163,184,0.06))', border: '#94a3b8', badge: '🥈' },
            { bg: 'linear-gradient(135deg, rgba(205,127,50,0.18), rgba(180,83,9,0.06))', border: '#b45309', badge: '🥉' },
          ];
          const rank = rankStyles[i] || { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', badge: null };

          return (
            <div key={c.id} style={{ marginBottom: 10, padding: 16, background: rank.bg, border: '1px solid ' + (isMe ? GOLD : rank.border), borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, textAlign: 'center', fontSize: 22, fontWeight: 800, color: GOLD }}>
                {rank.badge || ('#' + (i + 1))}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {c.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{c.name}</span>
                  <span style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(245,158,11,0.15)', color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 0.4 }}>{c.level.emoji} {c.level.name}</span>
                  {isMe && <span style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>YOU</span>}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {c.badges.slice(0, 6).map((key) => {
                    const b = badgeByKey(key);
                    if (!b) return null;
                    return (
                      <span key={key} title={b.name + ' — ' + b.desc}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 10, fontWeight: 700 }}>
                        <span style={{ fontSize: 12 }}>{b.emoji}</span> {b.name}
                      </span>
                    );
                  })}
                  {c.badges.length > 6 && <span style={{ fontSize: 10, color: '#64748b', padding: '3px 6px' }}>+{c.badges.length - 6}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: GOLD, lineHeight: 1 }}>{c.points}</div>
                <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>points</div>
                {c.streak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, justifyContent: 'flex-end', color: '#f97316', fontSize: 11, fontWeight: 700 }}>
                    <Flame size={11} /> {c.streak}d
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {ranked.length > 0 && (
          <div style={{ marginTop: 32, padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <Award size={20} color={GOLD} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Badges unlock at 12 milestones. Show them off — they live next to your child's name everywhere.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
