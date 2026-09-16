import React, { useState } from 'react';
import { Sparkles, Mic, Heart, Save, ArrowRight } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';

const STEPS = [
  {
    icon: <Sparkles size={34} />,
    color: '#ffb700',
    title: 'Welcome to WonderPal',
    body: 'A creative studio where your child speaks an idea and watches it become a 3D world. Not another video. Not another game. A place to imagine out loud.',
  },
  {
    icon: <Mic size={34} />,
    color: '#22d3ee',
    title: 'Their voice is the tool',
    body: 'No reading. No typing. Your child taps the big mic and speaks. WonderPal listens, transcribes, and builds a world from what they say. You can edit or reword before sending.',
  },
  {
    icon: <Heart size={34} />,
    color: '#f472b6',
    title: 'A friend who asks questions',
    body: 'After each world is built, a small companion asks your child one gentle question — "who lives here?", "what happens at night?". This is the moment where their imagination opens up. Sit with them.',
  },
  {
    icon: <Save size={34} />,
    color: '#a78bfa',
    title: 'Every world is kept',
    body: 'Each creation is saved to your child\'s collection, with a rendered picture they can look back on. Worlds compound — say "add a tower" and the world rebuilds itself around what came before.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useStudioStore((s) => s.completeOnboarding);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0812', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: 20, borderRadius: 24, background: s.color + '22', border: '1px solid ' + s.color + '55', color: s.color, marginBottom: 32 }}>
          {s.icon}
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, margin: '0 0 18px', color: '#fff', letterSpacing: -0.4 }}>
          {s.title}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: '#94a3b8', marginBottom: 40 }}>
          {s.body}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 28 : 8, height: 8, borderRadius: 4, background: i === step ? s.color : 'rgba(255,255,255,0.15)', transition: 'all .3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {step > 0 && (
            <button onClick={() => setStep((v) => v - 1)} style={{ padding: '14px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button
            onClick={() => { if (isLast) completeOnboarding(); else setStep((v) => v + 1); }}
            style={{ padding: '14px 30px', borderRadius: 16, background: 'linear-gradient(135deg, ' + s.color + ', #7c3aed)', border: 'none', color: '#000', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {isLast ? 'Begin' : 'Next'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
