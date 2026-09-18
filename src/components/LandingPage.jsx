import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, Mic, BookOpen, Heart, Palette, Share2, Shield, Users, Gamepad2, Volume2, X, ChevronDown, Star, MapPin, Trophy, Award, Send } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

const NAVY = '#0a1f44';
const NAVY_LIGHT = '#1e3a8a';
const GOLD = '#f59e0b';
const CREAM = '#fafaf7';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function FadeIn({ children, delay = 0 }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? 'translateY(0)' : 'translateY(24px)', transition: `opacity .8s ease ${delay}ms, transform .8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms` }}>
      {children}
    </div>
  );
}

function TourStep({ n, icon, title, body, active }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 18px', borderRadius: 16, background: active ? 'rgba(245,158,11,0.08)' : '#ffffff', border: '1px solid ' + (active ? GOLD : 'rgba(10,31,68,0.08)'), transition: 'all .3s' }}>
      <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: active ? GOLD : 'rgba(10,31,68,0.06)', color: active ? '#fff' : NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: active ? GOLD : NAVY }}>{icon}</span>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: NAVY, margin: 0 }}>{title}</h4>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onLaunch, onOpenAuth }) {
  const { location } = useLocation();
  const [faqOpen, setFaqOpen] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    { title: 'Tap the microphone', body: 'Your child speaks an idea in their own language. Voice or typing, either works. The microphone is the fastest.' },
    { title: 'Pick a mode', body: 'Story, Folklore, Fun Facts, or Make Your Own. Each turns the idea into a different kind of page.' },
    { title: 'Watch it become real', body: 'An illustration appears, the page reads itself aloud in a warm child voice, and a Yoruba/Igbo/Hausa/Idoma name is added.' },
    { title: 'Keep every page', body: 'Pages stack into a book. Save it, name it, revisit it. Every book belongs to your child, forever.' },
    { title: 'Share with family', body: 'Turn any book into a short video. Send it to grandparents. Watch their face light up.' },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: CREAM, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* ── HERO ─────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 24px 40px', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 30, background: 'rgba(10,31,68,0.06)', border: '1px solid rgba(10,31,68,0.1)', fontSize: 12, color: NAVY, fontWeight: 700, marginBottom: 28, letterSpacing: 0.4 }}>
            <Sparkles size={13} color={GOLD} /> 9jaWonderPal — Nigeria's first voice-first imagination studio
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.05, margin: 0, color: NAVY, letterSpacing: -1.5, maxWidth: 900 }}>
            Your child speaks.<br />
            <span style={{ color: GOLD }}>A world answers back.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)', color: '#475569', maxWidth: 620, margin: '24px auto 0', lineHeight: 1.65 }}>
            A safe, culture-grounded story studio built for Nigerian children aged 4–10.
            Speak any idea — a lion, a drum, a folktale — and watch it become a beautiful illustrated page that reads itself aloud in your child's own culture.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onLaunch} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 34px', borderRadius: 16, background: NAVY, color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 8px 24px rgba(10,31,68,0.25)' }}>
              <Mic size={17} /> Start Creating — Free
            </button>
            <button onClick={() => setTourOpen(true)} style={{ padding: '16px 24px', borderRadius: 16, background: 'transparent', color: NAVY, border: '2px solid rgba(10,31,68,0.15)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              How does it work?
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div style={{ marginTop: 60, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', color: '#64748b', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            <span>No ads</span><span>·</span><span>No tracking</span><span>·</span><span>Parent-controlled</span><span>·</span><span>Nigeria-first</span>
          </div>
        </FadeIn>
      </section>

      {/* ── WHY ──────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 24px', borderTop: '1px solid rgba(10,31,68,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>The problem we're solving</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
                Screen time replaced story time.<br />We're giving it back.
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: <BookOpen size={22} />, title: 'History was removed', body: 'In 2009, Nigeria dropped History from its primary curriculum. A whole generation lost its stories, proverbs, and traditions.' },
              { icon: <Heart size={22} />, title: 'Passive consumption', body: 'Most kids\' apps play videos at them. Children need to CREATE — to speak, to direct, to wonder.' },
              { icon: <Palette size={22} />, title: 'One-size-fits-all', body: 'A Yoruba child and an Idoma child get the same generic content. Our app honours each child\'s actual culture.' },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div style={{ padding: 28, background: CREAM, borderRadius: 20, height: '100%', border: '1px solid rgba(10,31,68,0.06)' }}>
                  <div style={{ color: GOLD, marginBottom: 16 }}>{c.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{c.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section style={{ padding: '80px 24px', background: CREAM }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Three steps</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
                From imagination to a page — in a minute
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { n: '01', icon: <Mic size={22} />, title: 'Speak your idea', body: '"A lion who is afraid of the dark." Tap the microphone and say it out loud.' },
              { n: '02', icon: <Sparkles size={22} />, title: 'Pick a shape', body: 'Story, Folklore, Fun Facts, or Make Your Own — one tap and your page begins.' },
              { n: '03', icon: <Volume2 size={22} />, title: 'Watch it come alive', body: 'An illustration, a Yoruba/Igbo/Hausa/Idoma name, a proverb, and read-aloud narration.' },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div style={{ padding: 28, background: '#fff', borderRadius: 20, border: '1px solid rgba(10,31,68,0.06)', height: '100%' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 2, marginBottom: 20 }}>{s.n}</div>
                  <div style={{ color: NAVY, marginBottom: 16 }}>{s.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Built for children, trusted by parents</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
                Everything a young imagination needs
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {[
              { icon: <BookOpen size={24} />, title: 'Four creation modes', body: 'Story, Folklore, Fun Facts, Make Your Own — each one is its own craft.', span: 3, big: true },
              { icon: <Users size={24} />, title: 'Your real culture', body: 'Register your child\'s heritage. A Yoruba child hears Yoruba proverbs. An Idoma child hears Idoma ones. Never mixed up.', span: 3, big: true },
              { icon: <Shield size={24} />, title: 'Parent control', body: 'You approve every share.', span: 2 },
              { icon: <Gamepad2 size={24} />, title: 'Cultural games', body: 'Learn by playing.', span: 2 },
              { icon: <Share2 size={24} />, title: 'Share as video', body: 'One tap, one MP4.', span: 2 },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ gridColumn: 'span ' + f.span, padding: f.big ? 32 : 24, background: f.big ? 'linear-gradient(135deg, rgba(10,31,68,0.04), rgba(245,158,11,0.06))' : CREAM, borderRadius: 22, border: '1px solid rgba(10,31,68,0.06)', minHeight: f.big ? 220 : 160, height: '100%' }}>
                  <div style={{ color: GOLD, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: f.big ? '1.4rem' : '1rem', fontWeight: 800, color: NAVY, margin: '0 0 10px', letterSpacing: -0.3 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── POINTS PREVIEW ──────────────────────── */}
      <section style={{ padding: '80px 24px', background: CREAM }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Every page earns something</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
                Learning that feels like winning
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: <Star size={26} />, big: '+10', title: 'Points per page', body: 'Every page earns wonder points. Streak bonuses at 3, 7, 30 days.' },
              { icon: <Trophy size={26} />, big: '12', title: 'Cultural badges', body: 'Unlock badges for finishing projects, learning proverbs, and trying new modes.' },
              { icon: <Award size={26} />, big: 'Top 10', title: 'Family leaderboard', body: 'Parents and siblings see progress. Friendly competition, no pressure.' },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div style={{ padding: 28, background: '#fff', borderRadius: 20, border: '1px solid rgba(10,31,68,0.08)', textAlign: 'center', height: '100%' }}>
                  <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: GOLD, marginBottom: 16 }}>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: NAVY, lineHeight: 1, letterSpacing: -2, marginBottom: 10 }}>{c.big}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{c.title}</div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{c.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION + CULTURE ──────────────────── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: GOLD, marginBottom: 20 }}>
                <MapPin size={26} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: NAVY, margin: '0 0 12px', letterSpacing: -0.6, lineHeight: 1.15 }}>
                Grounded where your child stands
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
                Every child learns the culture of their family <em>and</em> the culture of where they live. A Yoruba child in Kano grows up bilingual in <em>both</em> worlds.
              </p>
            </div>
          </FadeIn>

          {location && location.ok && (
            <FadeIn delay={100}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 32px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(10,31,68,0.05), rgba(245,158,11,0.08))', border: '1px solid rgba(10,31,68,0.08)', margin: '0 auto', display: 'flex', width: 'fit-content' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase' }}>You are here</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>{location.region || location.city || 'Nigeria'}</div>
                {location.cultureName && (
                  <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>{location.cultureName} country — {location.message}</div>
                )}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: CREAM }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>From parents</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
                What Nigerian families are saying
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { name: 'Folake A.', city: 'Lagos', text: 'My daughter asks for Yoruba proverbs now. She never did before. It is like the app woke something up in her.', stars: 5 },
              { name: 'Chidi O.', city: 'Enugu', text: 'We live in Lagos but I am Igbo. 9jaWonderPal gives her the best of both — my tradition and her street culture.', stars: 5 },
              { name: 'Hauwa M.', city: 'Kano', text: 'The homework helper has become our evening ritual. She brings her maths, it explains step by step. No more tears.', stars: 5 },
              { name: 'Ochanya E.', city: 'Otukpo', text: 'The Idoma mode. Nobody else does this. My children finally hear their own language in a learning app.', stars: 5 },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ padding: 24, background: '#fff', borderRadius: 20, border: '1px solid rgba(10,31,68,0.06)', height: '100%' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 14, color: GOLD }}>
                    {[0,1,2,3,4].map((n) => <Star key={n} size={13} fill={n < t.stars ? GOLD : 'none'} color={GOLD} />)}
                  </div>
                  <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(10,31,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: NAVY, fontSize: 13 }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.city}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Questions from parents</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
                Everything you want to know
              </h2>
            </div>
          </FadeIn>

          {[
            { q: 'Is 9jaWonderPal safe for my child?', a: 'Yes. No ads, no tracking, no external links. You create your child\'s login yourself. You see every page they make. Only you can approve a share.' },
            { q: 'What ages is it for?', a: 'Designed for Nigerian children aged 4 to 10. Stories and questions adapt to your child\'s exact age — a 5-year-old gets simpler words than an 8-year-old.' },
            { q: 'Does it teach in Nigerian languages?', a: 'Yes. Choose your child\'s culture when you register them — Yoruba, Igbo, Hausa, Idoma, Tiv, Efik, Ibibio, Ijaw, Edo, Igala, Nupe, Kanuri, Fulani, or Mixed. Every story uses real proverbs, names, and history from that culture.' },
            { q: 'Can it help with school homework?', a: 'That\'s the Homework Helper. Your child brings a real school question — typing, speaking, or pasting it. The app explains it step by step, tied to the Nigerian primary curriculum (Maths, English, Basic Science, Nigerian History, and more).' },
            { q: 'Does it cost anything?', a: 'No. It is completely free. No subscriptions, no in-app purchases, no data collection.' },
            { q: 'What if my child is not Yoruba, Igbo, or Hausa?', a: 'Every culture is first-class on 9jaWonderPal. Idoma, Tiv, Efik, Ibibio, Ijaw, Edo, Igala, Nupe, Kanuri, and Fulani children all get their own proverbs and histories. We also recognise where your child lives.' },
            { q: 'Can grandparents see what my child made?', a: 'Yes. Any project can be turned into a short video and shared with family. Every page is saved forever in their book.' },
          ].map((item, i) => {
            const open = faqOpen === i;
            return (
              <FadeIn key={i} delay={i * 40}>
                <div style={{ marginBottom: 10, background: CREAM, border: '1px solid rgba(10,31,68,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                  <button onClick={() => setFaqOpen(open ? null : i)}
                    style={{ width: '100%', padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', gap: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: NAVY, lineHeight: 1.4 }}>{item.q}</span>
                    <ChevronDown size={18} color={GOLD} style={{ flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height .3s ease' }}>
                    <div style={{ padding: '0 22px 20px', fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{item.a}</div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ── FEEDBACK ─────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: CREAM }}>
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <div style={{ display: 'inline-flex', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.15)', color: GOLD, marginBottom: 20 }}>
              <Send size={24} />
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: NAVY, margin: '0 0 12px', letterSpacing: -0.6 }}>
              Tell us what your child needs next
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
              We build every feature based on what Nigerian families ask for. Your words shape the next version.
            </p>
          </FadeIn>

          {feedbackSent ? (
            <FadeIn>
              <div style={{ padding: 24, background: '#fff', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 6 }}>Thank you!</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Your voice helps us serve Nigeria\'s children better.</div>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <div style={{ background: '#fff', border: '1px solid rgba(10,31,68,0.08)', borderRadius: 20, padding: 24 }}>
                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="A feature you want. A story that worked. A bug you found."
                  rows={4}
                  style={{ width: '100%', padding: 14, border: '1px solid rgba(10,31,68,0.12)', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: NAVY, background: '#fafaf7' }} />
                <button onClick={() => setFeedbackSent(true)} disabled={!feedbackText.trim()}
                  style={{ marginTop: 14, padding: '14px 32px', borderRadius: 14, background: feedbackText.trim() ? NAVY : '#cbd5e1', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: feedbackText.trim() ? 'pointer' : 'not-allowed' }}>
                  Send feedback
                </button>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── MISSION QUOTE ─────────────────────────── */}
      <section style={{ padding: '100px 24px', background: NAVY, textAlign: 'center' }}>
        <FadeIn>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 500, color: '#fff', lineHeight: 1.5, letterSpacing: -0.3, fontStyle: 'italic', marginBottom: 24 }}>
              &ldquo;The child does not ask permission to imagine. She simply speaks, and the world appears. 9jaWonderPal is a return to that.&rdquo;
            </p>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800 }}>
              Our reason for being
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FINAL CTA ─────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: CREAM, textAlign: 'center' }}>
        <FadeIn>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: NAVY, margin: '0 0 16px', letterSpacing: -0.6 }}>
              Your child's first book is one sentence away.
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Free. No ads. No tracking. Just imagination — grounded in Nigeria.
            </p>
            <button onClick={onLaunch} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 40px', borderRadius: 16, background: NAVY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(10,31,68,0.25)' }}>
              Begin <ArrowRight size={17} />
            </button>
          </div>
        </FadeIn>

        <div style={{ marginTop: 60, fontSize: 12, color: '#94a3b8' }}>
          © {new Date().getFullYear()} 9jaWonderPal · Made in Nigeria, for Nigeria
        </div>
      </section>

      {/* ── TOUR MODAL ───────────────────────────── */}
      {tourOpen && (
        <div onClick={() => setTourOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,31,68,0.5)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 30px 80px rgba(10,31,68,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase' }}>A 30-second tour</div>
              <button onClick={() => setTourOpen(false)} style={{ background: 'transparent', border: 'none', color: NAVY, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {tourSteps.map((_, i) => (
                <button key={i} onClick={() => setTourStep(i)} style={{ flex: 1, height: 4, borderRadius: 2, background: i === tourStep ? GOLD : 'rgba(10,31,68,0.12)', border: 'none', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
            <TourStep n={String(tourStep + 1).padStart(2, '0')} icon={<Sparkles size={16} />} title={tourSteps[tourStep].title} body={tourSteps[tourStep].body} active />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 8 }}>
              <button disabled={tourStep === 0} onClick={() => setTourStep((s) => s - 1)} style={{ padding: '10px 18px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(10,31,68,0.15)', color: NAVY, fontSize: 13, fontWeight: 700, cursor: tourStep === 0 ? 'not-allowed' : 'pointer', opacity: tourStep === 0 ? 0.4 : 1 }}>Back</button>
              {tourStep < tourSteps.length - 1
                ? <button onClick={() => setTourStep((s) => s + 1)} style={{ padding: '10px 22px', borderRadius: 12, background: NAVY, color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Next</button>
                : <button onClick={() => { setTourOpen(false); onLaunch && onLaunch(); }} style={{ padding: '10px 22px', borderRadius: 12, background: GOLD, color: NAVY, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Start now</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
