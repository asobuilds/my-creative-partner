import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Check, X, RefreshCw, ChevronRight } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { useGameProgressStore } from '../../store/gameProgressStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { proverbsForCulture } from '../../engine/gameContent';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const STAGE_CONFIG = {
  1: { options: 2, rounds: 4, basePoints: 10 },
  2: { options: 3, rounds: 5, basePoints: 12 },
  3: { options: 3, rounds: 6, basePoints: 14 },
};

export default function ProverbMatch({ onExit }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const savedStage = useGameProgressStore((s) => {
    if (!activeChild?.id) return 1;
    const child = s.progress[activeChild.id];
    return (child && child['proverb-match'] && child['proverb-match'].stage) || 1;
  });
  const recordResult = useGameProgressStore((s) => s.recordResult);
  const completeStage = useGameProgressStore((s) => s.completeStage);
  const recordGlobal = useGamificationStore((s) => s.recordPage);

  const [stage, setStage] = useState(savedStage);
  useEffect(() => { setStage(savedStage); }, [savedStage]);
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stageComplete, setStageComplete] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const completedRef = React.useRef(false);

  const proverbs = useMemo(() => proverbsForCulture(activeChild?.culture || 'default'), [activeChild?.culture]);
  const config = STAGE_CONFIG[Math.min(stage, 3)] || STAGE_CONFIG[3];

  useEffect(() => { completedRef.current = false; startStage(); }, [stage]);

  function startStage() {
    const q = shuffle(proverbs).slice(0, Math.min(config.rounds, proverbs.length));
    setQueue(q);
    setScore(0);
    setCombo(0);
    setRoundIndex(0);
    setStageComplete(false);
    setPicked(null);
    setFeedback(null);
    if (q.length) startRound(q, 0);
  }

  function startRound(q, idx) {
    const c = q[idx];
    const wrong = shuffle(proverbs.filter((r) => r.meaning !== c.meaning)).slice(0, config.options - 1);
    setCurrent({ ...c, idx });
    setOptions(shuffle([c, ...wrong]));
  }

  function pick(opt) {
    if (picked) return;
    setPicked(opt.meaning);
    const correct = opt.meaning === current.meaning;
    setFeedback(correct ? 'correct' : 'wrong');
    const result = recordResult(activeChild?.id, 'proverb-match', { correct, pointsBase: config.basePoints });
    if (correct && activeChild?.id && recordGlobal) {
      try {
        const g = recordGlobal(activeChild.id, 'game');
        if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g }));
      } catch (e) {}
    }
    if (correct) {
      setScore((s) => s + result.earned);
      setCombo(result.combo);
    } else {
      setCombo(0);
    }
    setTimeout(() => {
      const nextIdx = current.idx + 1;
      if (nextIdx >= queue.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          setStageComplete(true);
          completeStage(activeChild?.id, 'proverb-match', { finalScore: score + (correct ? result.earned : 0), stage });
          // STAGE_COMPLETE_HOOKED
          if (activeChild?.id && recordGlobal) {
            try { const g = recordGlobal(activeChild.id, 'game'); if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g })); } catch (e) {}
          }
        }
      } else {
        startRound(queue, nextIdx);
        setRoundIndex(nextIdx);
      }
      setPicked(null);
      setFeedback(null);
    }, correct ? 1000 : 1600);
  }

  if (stageComplete) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#0a0812', padding: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>📜</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Stage {stage} complete!</h2>
        <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 8 }}>You earned</p>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#a78bfa', marginBottom: 24, letterSpacing: -1 }}>{score}</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stage < 3 && (
            <button onClick={() => setStage(stage + 1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
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

  if (!current) return null;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', padding: '20px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd', fontSize: 11, fontWeight: 800 }}>
              Stage {stage}/3
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', fontSize: 14, fontWeight: 800 }}>
              {score} pts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {queue.map((_, i) => (
            <div key={i} style={{ width: i === roundIndex ? 24 : 8, height: 8, borderRadius: 4, background: i < roundIndex ? '#22c55e' : (i === roundIndex ? '#a78bfa' : 'rgba(255,255,255,0.1)'), transition: 'all .3s' }} />
          ))}
        </div>

        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#c4b5fd', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            {activeChild?.culture ? activeChild.culture.toUpperCase() : 'Nigerian'} proverb
          </div>
          <div style={{ fontSize: 20, fontStyle: 'italic', color: '#fff', lineHeight: 1.5, marginBottom: 8 }}>
            &ldquo;{current.text}&rdquo;
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 14 }}>
          What does it mean?
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {options.map((opt) => {
            const isPicked = picked === opt.meaning;
            const isCorrect = opt.meaning === current.meaning;
            const showCorrect = picked && isCorrect;
            const showWrong = picked && isPicked && !isCorrect;
            return (
              <button key={opt.meaning} onClick={() => pick(opt)} disabled={!!picked}
                style={{ padding: '16px 20px', borderRadius: 16, background: showCorrect ? 'rgba(34,197,94,0.2)' : showWrong ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)', border: '2px solid ' + (showCorrect ? '#22c55e' : showWrong ? '#ef4444' : 'rgba(255,255,255,0.1)'), color: '#e2e8f0', fontSize: 15, fontWeight: 600, cursor: picked ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, lineHeight: 1.5 }}>
                <span>{opt.meaning}</span>
                {showCorrect && <Check size={20} color="#22c55e" style={{ flexShrink: 0 }} />}
                {showWrong && <X size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {feedback === 'correct' && <div style={{ marginTop: 20, textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#22c55e' }}>{combo >= 2 ? `x${combo} combo!` : 'Correct!'}</div>}
        {feedback === 'wrong' && <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#fca5a5' }}>The right answer was: <strong>{current.meaning}</strong></div>}
      </div>
    </div>
  );
}
