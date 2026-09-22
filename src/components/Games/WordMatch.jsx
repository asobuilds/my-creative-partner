import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Check, X, RefreshCw, Trophy, Flame, ChevronRight } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { useGameProgressStore } from '../../store/gameProgressStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { wordsForCulture } from '../../engine/gameContent';
import { tap as sTap, correct as sCorrect, wrong as sWrong, combo as sCombo, badge as sBadge, stageComplete as sStageComplete, pointsEarned as sPoints, startGame as sStartGame, pageTurn as sPageTurn } from '../../engine/sound';
import WonderBackground from '../Background/WonderBackground';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const STAGE_CONFIG = {
  1: { options: 3, rounds: 5, basePoints: 10 },
  2: { options: 3, rounds: 6, basePoints: 12 },
  3: { options: 4, rounds: 6, basePoints: 14 },
  4: { options: 4, rounds: 7, basePoints: 16 },
  5: { options: 4, rounds: 8, basePoints: 20 },
};

export default function WordMatch({ onExit }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const savedStage = useGameProgressStore((s) => {
    if (!activeChild?.id) return 1;
    const child = s.progress[activeChild.id];
    return (child && child['word-match'] && child['word-match'].stage) || 1;
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
  const [comboFlash, setComboFlash] = useState(null);
  const completedRef = React.useRef(false);

  const words = useMemo(() => wordsForCulture(activeChild?.culture || 'default'), [activeChild?.culture]);
  const config = STAGE_CONFIG[Math.min(stage, 5)] || STAGE_CONFIG[5];

  useEffect(() => { completedRef.current = false; startStage(); }, [stage]);

  function startStage() {
    const q = shuffle(words).slice(0, config.rounds);
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
    const wrong = shuffle(words.filter((r) => r.word !== c.word)).slice(0, config.options - 1);
    setCurrent({ ...c, idx });
    setOptions(shuffle([c, ...wrong]));
  }

  function pick(opt) {
    if (picked) return;
    setPicked(opt.word);
    const correct = opt.word === current.word;
    setFeedback(correct ? 'correct' : 'wrong');
    const result = recordResult(activeChild?.id, 'word-match', { correct, pointsBase: config.basePoints });
    if (correct && activeChild?.id && recordGlobal) {
      try {
        const g = recordGlobal(activeChild.id, 'game');
        if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g }));
      } catch (e) {}
    }
    const newCombo = result?.combo || 0;
    const multiplier = result?.multiplier || 1;
    if (correct) {
      setScore((s) => s + result.earned);
      setCombo(newCombo);
      if (newCombo >= 2) {
        setComboFlash({ combo: newCombo, multiplier });
        setTimeout(() => setComboFlash(null), 1200);
      }
    } else {
      setCombo(0);
    }
    setTimeout(() => {
      const nextIdx = current.idx + 1;
      if (nextIdx >= queue.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          setStageComplete(true); try { sStageComplete(); } catch (e) {}
          const finalScore = score + (correct ? result.earned : 0);
          completeStage(activeChild?.id, 'word-match', { finalScore, stage });
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
    }, correct ? 900 : 1500);
  }

  if (stageComplete) {
    return (
    <WonderBackground variant="games">
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#0a0812', padding: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 16, animation: 'pop .5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>🏆</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0a1f44', margin: '0 0 8px' }}>Stage {stage} complete!</h2>
        <p style={{ fontSize: 16, color: '#475569', marginBottom: 8 }}>You earned</p>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#ffb700', marginBottom: 24, letterSpacing: -1 }}>{score}</div>
        <div style={{ fontSize: 14, color: '#475569', marginBottom: 32 }}>points</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stage < 5 && (
            <button onClick={() => setStage(stage + 1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#ffb700,#ff6b00)', color: '#000', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
              Next stage <ChevronRight size={16} />
            </button>
          )}
          <button onClick={startStage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.7)', color: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            <RefreshCw size={15} /> Replay
          </button>
          <button onClick={onExit} style={{ padding: '14px 24px', borderRadius: 14, background: 'transparent', color: '#475569', border: '1px solid rgba(255,255,255,0.12)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Back
          </button>
        </div>
        <style>{`@keyframes pop { 0% { transform: scale(0) } 60% { transform: scale(1.2) } 100% { transform: scale(1) } }`}</style>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', padding: '20px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', color: '#1e293b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd', fontSize: 11, fontWeight: 800 }}>
              Stage {stage}/5
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(255,183,0,0.15)', border: '1px solid rgba(255,183,0,0.4)', color: '#ffb700', fontSize: 14, fontWeight: 800 }}>
              {score} pts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {queue.map((_, i) => (
            <div key={i} style={{ width: i === roundIndex ? 24 : 8, height: 8, borderRadius: 4, background: i < roundIndex ? '#22c55e' : (i === roundIndex ? '#ffb700' : 'rgba(255,255,255,0.1)'), transition: 'all .3s' }} />
          ))}
        </div>

        {comboFlash && (
          <div style={{ textAlign: 'center', marginBottom: 16, animation: 'comboIn .3s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 20, background: 'linear-gradient(135deg, #ff6b00, #ffb700)', color: '#000', fontWeight: 800, fontSize: 15 }}>
              <Flame size={16} /> x{comboFlash.combo} COMBO! · {comboFlash.multiplier}x
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{current.emoji}</div>
          <div style={{ fontSize: 12, color: '#475569', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            Which word matches?
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0a1f44', letterSpacing: -0.5 }}>
            {current.meaning}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {options.map((opt) => {
            const isPicked = picked === opt.word;
            const isCorrect = opt.word === current.word;
            const showCorrect = picked && isCorrect;
            const showWrong = picked && isPicked && !isCorrect;
            return (
              <button key={opt.word} onClick={() => pick(opt)} disabled={!!picked}
                style={{
                  padding: '18px 22px', borderRadius: 18,
                  background: showCorrect ? 'rgba(34,197,94,0.2)' : showWrong ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                  border: '2px solid ' + (showCorrect ? '#22c55e' : showWrong ? '#ef4444' : 'rgba(255,255,255,0.1)'),
                  color: '#0a1f44', fontSize: 20, fontWeight: 800,
                  cursor: picked ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all .2s',
                }}>
                <span>{opt.word}</span>
                {showCorrect && <Check size={22} color="#22c55e" />}
                {showWrong && <X size={22} color="#ef4444" />}
              </button>
            );
          })}
        </div>

        {feedback === 'correct' && (
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#22c55e' }}>
            {combo >= 2 ? `x${combo} combo!` : 'Correct!'}
          </div>
        )}
        {feedback === 'wrong' && (
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 15, color: '#fca5a5' }}>
            The right answer was <strong>{current.word}</strong>. You will get the next one!
          </div>
        )}
      </div>
      <style>{`
        @keyframes comboIn { from { opacity: 0; transform: scale(0.8) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
    </WonderBackground>
  );
}
