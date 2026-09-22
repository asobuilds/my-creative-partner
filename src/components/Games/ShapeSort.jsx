import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { useGameProgressStore } from '../../store/gameProgressStore';
import { useGamificationStore } from '../../store/gamificationStore';

const ALL_SHAPES = [
  { key: 'circle', label: 'Circle', emoji: '⚫', color: '#ffb700' },
  { key: 'square', label: 'Square', emoji: '⬛', color: '#22d3ee' },
  { key: 'triangle', label: 'Triangle', emoji: '🔺', color: '#a78bfa' },
  { key: 'star', label: 'Star', emoji: '⭐', color: '#f472b6' },
  { key: 'diamond', label: 'Diamond', emoji: '🔷', color: '#4ade80' },
  { key: 'heart', label: 'Heart', emoji: '❤️', color: '#ef4444' },
];

const STAGE_CONFIG = {
  1: { shapes: 3, pieces: 3, basePoints: 8 },
  2: { shapes: 4, pieces: 4, basePoints: 10 },
  3: { shapes: 4, pieces: 6, basePoints: 12 },
  4: { shapes: 5, pieces: 6, basePoints: 14 },
  5: { shapes: 6, pieces: 8, basePoints: 16 },
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function ShapeSort({ onExit }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const savedStage = useGameProgressStore((s) => {
    if (!activeChild?.id) return 1;
    const child = s.progress[activeChild.id];
    return (child && child['shape-sort'] && child['shape-sort'].stage) || 1;
  });
  const recordResult = useGameProgressStore((s) => s.recordResult);
  const completeStage = useGameProgressStore((s) => s.completeStage);
  const recordGlobal = useGamificationStore((s) => s.recordPage);

  const [stage, setStage] = useState(savedStage);
  useEffect(() => { setStage(savedStage); }, [savedStage]);
  const [pool, setPool] = useState([]);
  const [slots, setSlots] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [comboFlash, setComboFlash] = useState(null);

  const config = STAGE_CONFIG[Math.min(stage, 5)] || STAGE_CONFIG[5];

  useEffect(() => { startStage(); }, [stage]);

  function startStage() {
    const picks = shuffle(ALL_SHAPES).slice(0, config.shapes);
    const p = [];
    for (let i = 0; i < config.pieces; i++) {
      const shape = picks[i % picks.length];
      p.push({ ...shape, id: shape.key + '-' + i });
    }
    setPool(shuffle(p));
    setSlots(picks.map((s) => ({ ...s, filled: null })));
    setScore(0);
    setCombo(0);
    setStageComplete(false);
  }

  function onDropOnSlot(slot) {
    if (!dragging) return;
    const correct = dragging.key === slot.key;
    const result = recordResult(activeChild?.id, 'shape-sort', { correct, pointsBase: config.basePoints });
    if (correct && activeChild?.id && recordGlobal) {
      try {
        const g = recordGlobal(activeChild.id, 'game');
        if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g }));
      } catch (e) {}
    }
    if (correct) {
      setPool((p) => p.filter((i) => i.id !== dragging.id));
      setSlots((s) => s.map((x) => x.key === slot.key ? { ...x, filled: dragging } : x));
      setScore((v) => v + result.earned);
      const newCombo = result.combo;
      setCombo(newCombo);
      if (newCombo >= 2) {
        setComboFlash({ combo: newCombo, multiplier: result.multiplier });
        setTimeout(() => setComboFlash(null), 1200);
      }
    } else {
      setScore((v) => Math.max(0, v - 2));
      setCombo(0);
    }
    setDragging(null);
  }

  // Completion check runs only when slots change, and only fires once
  const completedRef = React.useRef(false);
  useEffect(() => {
    if (completedRef.current) return;
    const allFilled = slots.length > 0 && slots.every((s) => s.filled);
    if (pool.length === 0 && allFilled) {
      completedRef.current = true;
      const t = setTimeout(() => {
        setStageComplete(true);
        completeStage(activeChild?.id, 'shape-sort', { finalScore: score, stage });
          // STAGE_COMPLETE_HOOKED
          if (activeChild?.id && recordGlobal) {
            try { const g = recordGlobal(activeChild.id, 'game'); if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g })); } catch (e) {}
          }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [pool.length, slots]);

  // Reset the completion guard when a new stage starts
  useEffect(() => { completedRef.current = false; }, [stage]);

  if (stageComplete) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#0a0812', padding: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Stage {stage} complete!</h2>
        <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 8 }}>You earned</p>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#22d3ee', marginBottom: 24, letterSpacing: -1 }}>{score}</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stage < 5 && (
            <button onClick={() => setStage(stage + 1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#22d3ee,#3b82f6)', color: '#000', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
              Next stage <ChevronRight size={16} />
            </button>
          )}
          <button onClick={startStage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            <RefreshCw size={15} /> Replay
          </button>
          <button onClick={onExit} style={{ padding: '14px 24px', borderRadius: 14, background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', padding: '20px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd', fontSize: 11, fontWeight: 800 }}>
              Stage {stage}/5
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)', color: '#22d3ee', fontSize: 14, fontWeight: 800 }}>
              {score} pts
            </div>
          </div>
        </div>

        {comboFlash && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 20, background: 'linear-gradient(135deg, #22d3ee, #3b82f6)', color: '#000', fontWeight: 800, fontSize: 15 }}>
              🔥 x{comboFlash.combo} COMBO!
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', textAlign: 'center', margin: '0 0 6px' }}>Match the shape to its place</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: '0 0 24px' }}>Drag each shape to its matching slot.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginBottom: 24 }}>
          {slots.map((slot) => (
            <div key={slot.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropOnSlot(slot)}
              style={{ padding: 16, borderRadius: 18, background: slot.filled ? slot.color + '22' : 'rgba(255,255,255,0.03)', border: '2px dashed ' + (slot.filled ? slot.color : 'rgba(255,255,255,0.15)'), minHeight: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div style={{ fontSize: 28 }}>{slot.filled ? slot.filled.emoji : '❓'}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{slot.label}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Drag from here</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {pool.map((item) => (
              <div key={item.id} draggable onDragStart={() => setDragging(item)}
                style={{ width: 56, height: 56, borderRadius: 14, background: item.color + '22', border: '2px solid ' + item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, cursor: 'grab' }}>
                {item.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
