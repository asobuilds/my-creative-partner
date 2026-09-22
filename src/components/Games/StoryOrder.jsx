import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, RefreshCw, ChevronRight, Check, X } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';
import { useStudioStore } from '../../store/studioStore';
import { useGameProgressStore } from '../../store/gameProgressStore';
import { useGamificationStore } from '../../store/gamificationStore';
import WonderBackground from '../Background/WonderBackground';
import { tap as sTap, correct as sCorrect, wrong as sWrong, stageComplete as sStageComplete } from '../../engine/sound';

const FALLBACK_STORIES = [
  { id: 'story-1', title: 'The Lost Drum', sentences: [
    'Ada found an old drum in her grandmother\u2019s attic.',
    'She tapped it gently and a soft sound filled the room.',
    'Her grandmother smiled and told her it was a talking drum.',
    'Ada learned the rhythms her great-grandmother played.',
    'That night, she played the drum for the whole family.',
  ]},
  { id: 'story-2', title: 'The Kind Elephant', sentences: [
    'Elephant walked slowly through the tall grass.',
    'He found a small bird with a broken wing.',
    'Elephant gently lifted the bird onto a branch.',
    'The bird sang a beautiful song of thanks.',
    'From that day, Elephant and Bird were friends.',
  ]},
  { id: 'story-3', title: 'The Clever Tortoise', sentences: [
    'Tortoise wanted to reach the fruit at the top of the tree.',
    'He could not climb, so he thought and thought.',
    'Tortoise called his friends the birds.',
    'The birds carried him to the top, one wing at a time.',
    'Tortoise shared the fruit with everyone.',
  ]},
];

const STAGE_CONFIG = {
  1: { sentences: 3, basePoints: 10 },
  2: { sentences: 3, basePoints: 12 },
  3: { sentences: 4, basePoints: 14 },
  4: { sentences: 4, basePoints: 16 },
  5: { sentences: 5, basePoints: 20 },
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function StoryOrder({ onExit }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const pages = useStudioStore((s) => s.pages);
  const savedStage = useGameProgressStore((s) => {
    if (!activeChild?.id) return 1;
    const child = s.progress[activeChild.id];
    return (child && child['story-order'] && child['story-order'].stage) || 1;
  });
  const recordResult = useGameProgressStore((s) => s.recordResult);
  const completeStage = useGameProgressStore((s) => s.completeStage);
  const recordGlobal = useGamificationStore((s) => s.recordPage);

  const [stage, setStage] = useState(savedStage);
  useEffect(() => { setStage(savedStage); }, [savedStage]);

  const [current, setCurrent] = useState(null);
  const [shuffled, setShuffled] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [queue, setQueue] = useState([]);

  const config = STAGE_CONFIG[Math.min(stage, 5)] || STAGE_CONFIG[5];

  // Build queue: use child's own pages if they have enough sentences, else fallback stories
  const storyPool = useMemo(() => {
    const own = [];
    if (pages && pages.length >= 2) {
      // Build a mini-story from the child's own page titles in order
      const ownSentences = pages.slice(-5).map((p) => (p.title ? p.title + '.' : (p.story || '').slice(0, 60)));
      if (ownSentences.length >= 3) {
        own.push({ id: 'own-' + Date.now(), title: 'Your own book!', sentences: ownSentences });
      }
    }
    return [...own, ...FALLBACK_STORIES];
  }, [pages]);

  useEffect(() => { startStage(); }, [stage]);

  function startStage() {
    const q = shuffle(storyPool).slice(0, 3); // 3 stories per stage
    setQueue(q);
    setScore(0);
    setRound(0);
    setStageComplete(false);
    setChecked(false);
    if (q.length) startRound(q, 0);
  }

  function startRound(q, idx) {
    const story = q[idx];
    const sentences = story.sentences.slice(0, config.sentences);
    const shuffledList = shuffle(sentences.map((s, i) => ({ text: s, correctIndex: i })));
    setCurrent({ ...story, sentences });
    setShuffled(shuffledList);
    setUserOrder([]);
    setChecked(false);
  }

  function pickSentence(item) {
    if (checked) return;
    try { sTap(); } catch (e) {}
    if (userOrder.find((x) => x.text === item.text)) return;
    setUserOrder([...userOrder, item]);
  }

  function unpick(index) {
    if (checked) return;
    try { sTap(); } catch (e) {}
    const next = [...userOrder];
    next.splice(index, 1);
    setUserOrder(next);
  }

  function checkOrder() {
    if (userOrder.length !== current.sentences.length) return;
    setChecked(true);
    const isCorrect = userOrder.every((item, i) => item.correctIndex === i);
    if (isCorrect) {
      try { sCorrect(); } catch (e) {}
      const pts = config.basePoints;
      setScore((v) => v + pts);
      const r = recordResult(activeChild?.id, 'story-order', { correct: true, pointsBase: pts });
      if (activeChild?.id && recordGlobal) {
        try {
          const g = recordGlobal(activeChild.id, 'game');
          if (typeof window !== 'undefined' && g) window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: g }));
        } catch (e) {}
      }
    } else {
      try { sWrong(); } catch (e) {}
      recordResult(activeChild?.id, 'story-order', { correct: false, pointsBase: 0 });
    }
    // Auto-advance after a pause
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= queue.length) {
        setStageComplete(true);
        try { sStageComplete(); } catch (e) {}
        completeStage(activeChild?.id, 'story-order', { finalScore: score, stage });
      } else {
        setRound(nextRound);
        startRound(queue, nextRound);
      }
    }, 2200);
  }

  /* ── Completion screen ── */
  if (stageComplete) {
    return (
      <WonderBackground variant="story">
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 20 }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'pop .5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>📖</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0a1f44', margin: '0 0 8px' }}>Stage {stage} complete!</h2>
          <p style={{ fontSize: 16, color: '#475569', marginBottom: 8 }}>You earned</p>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#f472b6', marginBottom: 24, letterSpacing: -1 }}>{score}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {stage < 5 && (
              <button onClick={() => setStage(stage + 1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#f472b6,#a78bfa)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
                Next stage <ChevronRight size={16} />
              </button>
            )}
            <button onClick={startStage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.7)', color: '#0a1f44', border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
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

  if (!current) return null;

  const allPlaced = userOrder.length === current.sentences.length;

  return (
    <WonderBackground variant="story">
      <div style={{ height: '100%', overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', color: '#0a1f44', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(244,114,182,0.2)', color: '#be185d', fontSize: 11, fontWeight: 800 }}>Stage {stage}/5</div>
              <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(244,114,182,0.15)', color: '#be185d', fontSize: 14, fontWeight: 800 }}>{score} pts</div>
            </div>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1f44', textAlign: 'center', margin: '0 0 6px' }}>Put the story in order</h2>
          <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', margin: '0 0 20px' }}>Tap sentences in the order they should happen.</p>

          {/* Timeline */}
          <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.75)', border: '2px dashed rgba(244,114,182,0.5)', marginBottom: 20, minHeight: 120 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#be185d', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>Your story</div>
            {userOrder.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>Tap sentences below to begin...</div>}
            {userOrder.map((item, i) => {
              const isCorrect = checked && item.correctIndex === i;
              const isWrong = checked && item.correctIndex !== i;
              return (
                <div key={i} onClick={() => unpick(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 8,
                  borderRadius: 12,
                  background: isCorrect ? 'rgba(34,197,94,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : 'rgba(244,114,182,0.08)',
                  border: '1px solid ' + (isCorrect ? '#22c55e' : isWrong ? '#ef4444' : 'rgba(244,114,182,0.3)'),
                  cursor: checked ? 'default' : 'pointer',
                }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f472b6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 13.5, color: '#0a1f44', lineHeight: 1.5 }}>{item.text}</div>
                  {isCorrect && <Check size={18} color="#22c55e" />}
                  {isWrong && <X size={18} color="#ef4444" />}
                </div>
              );
            })}
          </div>

          {/* Available sentences */}
          {!checked && (
            <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Tap in order</div>
              {shuffled.filter((s) => !userOrder.find((x) => x.text === s.text)).map((s, i) => (
                <button key={i} onClick={() => pickSentence(s)} style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px', marginBottom: 8,
                  borderRadius: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                  color: '#0a1f44', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', lineHeight: 1.5,
                }}>{s.text}</button>
              ))}
            </div>
          )}

          {/* Check button */}
          {allPlaced && !checked && (
            <button onClick={checkOrder} style={{
              width: '100%', marginTop: 16, padding: 16, borderRadius: 16,
              background: 'linear-gradient(135deg,#f472b6,#a78bfa)', color: '#fff',
              border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            }}>Check my order</button>
          )}

          {checked && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 15, fontWeight: 800, color: userOrder.every((it, i) => it.correctIndex === i) ? '#22c55e' : '#ef4444' }}>
              {userOrder.every((it, i) => it.correctIndex === i) ? 'Perfect order!' : 'Not quite — look at the numbers again.'}
            </div>
          )}
        </div>
      </div>
    </WonderBackground>
  );
}
