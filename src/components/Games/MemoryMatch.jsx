import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { useGameProgressStore } from '../../store/gameProgressStore';
import { useGamificationStore } from '../../store/gamificationStore';
import WonderBackground from '../Background/WonderBackground';
import { tap as sTap, correct as sCorrect, wrong as sWrong, stageComplete as sStageComplete } from '../../engine/sound';

const EMOJI_POOL = ['🦁','🐘','🐢','🦅','🥁','🌙','🌊','🌳','🔥','💧','⭐','🌸','🦋','🐝','🍎','🥭','👑','🛖','🎨','📖'];

const STAGE_CONFIG = {
  1: { pairs: 3, basePoints: 10 },
  2: { pairs: 4, basePoints: 12 },
  3: { pairs: 6, basePoints: 14 },
  4: { pairs: 8, basePoints: 16 },
  5: { pairs: 10, basePoints: 20 },
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function MemoryMatch({ onExit }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const savedStage = useGameProgressStore((s) => {
    if (!activeChild?.id) return 1;
    const child = s.progress[activeChild.id];
    return (child && child['memory-match'] && child['memory-match'].stage) || 1;
  });
  const recordResult = useGameProgressStore((s) => s.recordResult);
  const completeStage = useGameProgressStore((s) => s.completeStage);
  const recordGlobal = useGamificationStore((s) => s.recordPage);

  const [stage, setStage] = useState(savedStage);
  useEffect(() => { setStage(savedStage); }, [savedStage]);

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  const config = STAGE_CONFIG[Math.min(stage, 5)] || STAGE_CONFIG[5];

  useEffect(() => { startStage(); }, [stage]);

  function startStage() {
    const emojis = shuffle(EMOJI_POOL).slice(0, config.pairs);
    const doubled = [...emojis, ...emojis].map((e, i) => ({ id: i, emoji: e, pair: e }));
    setCards(shuffle(doubled));
    setFlipped([]);
    setMatched(new Set());
    setScore(0);
    setMoves(0);
    setStageComplete(false);
    setBusy(false);
  }

  function flipCard(card) {
    if (busy) return;
    if (flipped.find((c) => c.id === card.id)) return;
    if (matched.has(card.pair)) return;
    try { sTap(); } catch (e) {}

    const next = [...flipped, card];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      setBusy(true);
      const [a, b] = next;
      if (a.pair === b.pair) {
        // Match
        setTimeout(() => {
          try { sCorrect(); } catch (e) {}
          const nextMatched = new Set(matched);
          nextMatched.add(a.pair);
          setMatched(nextMatched);
          setFlipped([]);
          setBusy(false);
          const pts = config.basePoints;
          setScore((v) => v + pts);
          const r = recordResult(activeChild?.id, 'memory-match', { correct: true, pointsBase: pts });
          if (activeChild?.id && recordGlobal) {
            try {
              const g = recordGlobal(activeChild.id, 'game');
              if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g }));
            } catch (e) {}
          }
          if (nextMatched.size === config.pairs) {
            setTimeout(() => {
              setStageComplete(true);
              try { sStageComplete(); } catch (e) {}
              completeStage(activeChild?.id, 'memory-match', { finalScore: score + pts, stage });
            }, 400);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          try { sWrong(); } catch (e) {}
          setFlipped([]);
          setBusy(false);
          recordResult(activeChild?.id, 'memory-match', { correct: false, pointsBase: 0 });
        }, 900);
      }
    }
  }

  const gridCols = useMemo(() => {
    const total = cards.length;
    if (total <= 6) return 3;
    if (total <= 8) return 4;
    if (total <= 12) return 4;
    return 5;
  }, [cards.length]);

  if (stageComplete) {
    return (
      <WonderBackground variant="celebrate">
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 20 }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'pop .5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0a1f44', margin: '0 0 8px' }}>All pairs found!</h2>
          <p style={{ fontSize: 16, color: '#475569', marginBottom: 8 }}>You scored</p>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#ff5c8a', marginBottom: 8, letterSpacing: -1 }}>{score}</div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>in {moves} moves</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {stage < 5 && (
              <button onClick={() => setStage(stage + 1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#ff5c8a,#ffb700)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
                Next stage <ChevronRight size={16} />
              </button>
            )}
            <button onClick={startStage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.75)', color: '#0a1f44', border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              <RefreshCw size={15} /> Replay
            </button>
            <button onClick={onExit} style={{ padding: '14px 24px', borderRadius: 14, background: 'transparent', color: '#475569', border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Back
            </button>
          </div>
          <style>{`@keyframes pop { 0% { transform: scale(0) } 60% { transform: scale(1.2) } 100% { transform: scale(1) } }`}</style>
        </div>
      </WonderBackground>
    );
  }

  return (
    <WonderBackground variant="celebrate">
      <div style={{ height: '100%', overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', color: '#0a1f44', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,92,138,0.2)', color: '#be185d', fontSize: 11, fontWeight: 800 }}>Stage {stage}/5</div>
              <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(255,92,138,0.15)', color: '#be185d', fontSize: 14, fontWeight: 800 }}>{score} pts</div>
            </div>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1f44', textAlign: 'center', margin: '0 0 6px' }}>Find the pairs</h2>
          <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', margin: '0 0 20px' }}>Tap two cards. If they match, they stay open.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + gridCols + ', 1fr)', gap: 10 }}>
            {cards.map((card) => {
              const isFlipped = flipped.find((c) => c.id === card.id);
              const isMatched = matched.has(card.pair);
              return (
                <button key={card.id} onClick={() => flipCard(card)}
                  style={{
                    aspectRatio: '1 / 1', borderRadius: 16, cursor: isMatched ? 'default' : 'pointer',
                    background: isMatched ? 'rgba(34,197,94,0.15)'
                              : isFlipped ? 'linear-gradient(135deg, #ffb700, #ff5c8a)'
                              : 'linear-gradient(135deg, #ff8fb1, #a78bfa)',
                    border: '2px solid ' + (isMatched ? '#22c55e' : 'rgba(255,255,255,0.5)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'clamp(24px, 5vw, 40px)',
                    transition: 'all .25s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isFlipped ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  {isFlipped || isMatched ? card.emoji : '❓'}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#475569', fontWeight: 700 }}>
            {matched.size} / {config.pairs} pairs · {moves} moves
          </div>
        </div>
      </div>
    </WonderBackground>
  );
}
