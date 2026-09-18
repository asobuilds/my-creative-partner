import React, { useState } from 'react';
import { Sparkles, RefreshCw, Rocket, Compass, Volume2 } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';
import { useAccountStore } from '../../store/accountStore';

const CATEGORIES = {
  nature: ['a river that sings', 'a talking parrot in Lagos', 'the harmattan wind', 'a baobab tree that remembers', 'the first rain of the year'],
  folklore: ['Ìjàpá and the drum that would not stop', 'Mbe the tortoise tricks the elephant', 'why the chameleon changes colour', 'the moon goddess and her lost calabash', 'the boy who could hear trees'],
  history: ['Queen Amina of Zazzau', 'the walls of Benin City', 'a child in ancient Ifẹ̀', 'the first talking drum', 'Lagos before the bridges'],
  family: ['my grandmother\'s cooking pot', 'a family that lives in the clouds', 'my father\'s first bicycle', 'a house that follows us', 'the market on Saturday'],
  imaginary: ['a lion afraid of the dark', 'a door in the middle of the ocean', 'a moon made of candy', 'a rainbow with seven languages', 'a dog who speaks Yoruba'],
};

export default function SparkView({ onStart }) {
  const mood = useStudioStore((s) => s.mood);
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const [category, setCategory] = useState('nature');
  const [current, setCurrent] = useState(() => CATEGORIES.nature[0]);

  function shuffle() {
    const arr = CATEGORIES[category];
    setCurrent(arr[Math.floor(Math.random() * arr.length)]);
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0a0812', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: mood.primary, marginBottom: 16 }}>
            <Sparkles size={26} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Sparks</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            {activeChild ? 'Pick a spark for ' + activeChild.name : 'Ideas to start with when imagination needs a push.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {Object.keys(CATEGORIES).map((c) => (
            <button key={c} onClick={() => { setCategory(c); setCurrent(CATEGORIES[c][0]); }}
              style={{ padding: '8px 16px', borderRadius: 12, background: category === c ? 'linear-gradient(135deg, ' + mood.primary + ', ' + mood.accent + ')' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (category === c ? mood.primary : 'rgba(255,255,255,0.08)'), color: category === c ? '#000' : '#cbd5e1', fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{c}</button>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(167,139,250,0.1))', border: '1px solid ' + mood.primary + '55', borderRadius: 24, padding: 40, textAlign: 'center', marginBottom: 24, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: mood.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Today's spark</div>
          <div style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 24 }}>&ldquo;{current}&rdquo;</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={shuffle} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              <RefreshCw size={15} /> Shuffle
            </button>
            <button onClick={() => onStart && onStart(current)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(135deg, ' + mood.primary + ', ' + mood.accent + ')', color: '#000', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <Rocket size={15} /> Use this spark
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Compass size={20} color={mood.primary} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '12px 0 6px' }}>Try a new mode</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Every spark can become a Story, Folklore, Fun Facts, or Make Your Own page.</p>
          </div>
          <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Volume2 size={20} color={mood.accent} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '12px 0 6px' }}>Say it out loud</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Tap the mic and speak the spark. Speech becomes a page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
