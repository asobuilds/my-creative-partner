import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Users, Globe, Heart, Check, Sparkles } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';

const CULTURE_OPTIONS = [
  { key: 'yoruba', name: 'Yoruba', region: 'South-West' },
  { key: 'igbo', name: 'Igbo', region: 'South-East' },
  { key: 'hausa', name: 'Hausa', region: 'North-West' },
  { key: 'fulani', name: 'Fulani', region: 'Sahel / North' },
  { key: 'idoma', name: 'Idoma', region: 'Benue State' },
  { key: 'tiv', name: 'Tiv', region: 'Benue / Taraba' },
  { key: 'efik', name: 'Efik', region: 'Cross River' },
  { key: 'ibibio', name: 'Ibibio', region: 'Akwa Ibom' },
  { key: 'ijaw', name: 'Ijaw', region: 'Niger Delta' },
  { key: 'edo', name: 'Edo (Bini)', region: 'Edo State' },
  { key: 'igala', name: 'Igala', region: 'Kogi State' },
  { key: 'nupe', name: 'Nupe', region: 'Niger State' },
  { key: 'kanuri', name: 'Kanuri', region: 'Borno / Yobe' },
  { key: 'mixed', name: 'Mixed heritage', region: 'Nigeria' },
];

const INTEREST_OPTIONS = [
  'animals', 'space', 'dinosairs', 'ocean', 'stories', 'music',
  'food', 'sports', 'science', 'art', 'family', 'africa', 'history',
];

const warm = '#ffb700';
const accent = '#a78bfa';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [parentData, setParentData] = useState({ name: '', email: '', phone: '' });
  const [childData, setChildData] = useState({
    name: '', age: 7, gender: 'unspecified', avatar: '🌟',
    culture: null, interests: [],
  });
  const [addedChildren, setAddedChildren] = useState([]);
  const [error, setError] = useState(null);

  const createParent = useAccountStore((s) => s.createParent);
  const addChild = useAccountStore((s) => s.addChild);
  const completeOnboarding = useAccountStore((s) => s.completeOnboarding);

  const next = () => { setError(null); setStep((s) => s + 1); };
  const back = () => { setError(null); setStep((s) => Math.max(0, s - 1)); };

  const stepDone = () => {
    if (step === 1) return parentData.name && parentData.email;
    if (step === 2) return childData.name && childData.age >= 3 && childData.age <= 14;
    if (step === 3) return !!childData.culture;
    return true;
  };

  const addCurrentChild = () => {
    const newChild = addChild(childData);
    setAddedChildren((arr) => [...arr, newChild]);
    setChildData({ name: '', age: 7, gender: 'unspecified', avatar: '🌟', culture: null, interests: [] });
    return newChild;
  };

  const finish = () => {
    let finalChildren = addedChildren;
    if (childData.name && childData.age && childData.culture) {
      const lastChild = addCurrentChild();
      finalChildren = [...addedChildren, lastChild];
    }
    if (!finalChildren.length) {
      setError('Please add at least one child.');
      return;
    }
    completeOnboarding();
    window.location.reload();
  };

  const toggleInterest = (i) => {
    setChildData((c) => ({
      ...c,
      interests: c.interests.includes(i) ? c.interests.filter((x) => x !== i) : [...c.interests, i],
    }));
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', fontSize: 15,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14, color: '#fff', outline: 'none',
  };

  const cardStyle = (active) => ({
    padding: 16, borderRadius: 14, cursor: 'pointer',
    background: active ? 'rgba(255,183,0,0.15)' : 'rgba(255,255,255,0.03)',
    border: '2px solid ' + (active ? warm : 'rgba(255,255,255,0.08)'),
    transition: 'all .15s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'radial-gradient(circle at 50% 20%, #1a1230 0%, #0a0812 60%)',
      overflowY: 'auto', padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              width: i === step ? 32 : 8, height: 8, borderRadius: 4,
              background: i <= step ? warm : 'rgba(255,255,255,0.15)',
              transition: 'all .3s',
            }} />
          ))}
        </div>

        {step === 0 && (
          <Screen icon={<Sparkles size={40} />} title="Welcome to 9jaWonderPal"
            subtitle="A safe, culture-grounded imagination studio for Nigerian children. Every story your child makes will honour their heritage.">
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#94a3b8', marginBottom: 24 }}>
              In a few short steps we will set up your parent account and register each child with their culture, interests, and age.
              Every story is then tailored to them — not to a generic Nigerian child.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#64748b' }}>
              You stay in control. You see everything. You can add or remove children at any time.
            </p>
          </Screen>
        )}

        {step === 1 && (
          <Screen icon={<User size={40} />} title="Your parent account" subtitle="This is you. Your children will be connected to it.">
            <input style={inputStyle} placeholder="Your full name" value={parentData.name}
              onChange={(e) => setParentData({ ...parentData, name: e.target.value })} />
            <div style={{ height: 12 }} />
            <input style={inputStyle} placeholder="Email address" type="email" value={parentData.email}
              onChange={(e) => setParentData({ ...parentData, email: e.target.value })} />
            <div style={{ height: 12 }} />
            <input style={inputStyle} placeholder="Phone (optional)" value={parentData.phone}
              onChange={(e) => setParentData({ ...parentData, phone: e.target.value })} />
          </Screen>
        )}

        {step === 2 && (
          <Screen icon={<Users size={40} />} title={addedChildren.length ? "Add another child" : "Tell us about your child"}
            subtitle={addedChildren.length ? addedChildren.length + " added so far. Add more, or continue." : "Every story will be personalised to them."}>
            <input style={inputStyle} placeholder="Child's name" value={childData.name}
              onChange={(e) => setChildData({ ...childData, name: e.target.value })} />
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Age</label>
                <input style={inputStyle} type="number" min={3} max={14} value={childData.age}
                  onChange={(e) => setChildData({ ...childData, age: Number(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Gender</label>
                <select style={inputStyle} value={childData.gender}
                  onChange={(e) => setChildData({ ...childData, gender: e.target.value })}>
                  <option value="unspecified">Prefer not to say</option>
                  <option value="girl">Girl</option>
                  <option value="boy">Boy</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Avatar</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {['🌟', '🦁', '🐢', '🦅', '��', '🥁', '🌈', '🌙', '🐆', '🌸'].map((a) => (
                  <button key={a} onClick={() => setChildData({ ...childData, avatar: a })}
                    style={{ width: 48, height: 48, fontSize: 22, borderRadius: 14, cursor: 'pointer',
                      background: childData.avatar === a ? 'rgba(255,183,0,0.2)' : 'rgba(255,255,255,0.04)',
                      border: '2px solid ' + (childData.avatar === a ? warm : 'transparent') }}>{a}</button>
                ))}
              </div>
            </div>
          </Screen>
        )}

        {step === 3 && (
          <Screen icon={<Globe size={40} />} title="Which culture is your child part of?"
            subtitle="Stories will use proverbs, names, and history from this tradition.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
              {CULTURE_OPTIONS.map((c) => (
                <div key={c.key} onClick={() => setChildData({ ...childData, culture: c.key })}
                  style={cardStyle(childData.culture === c.key)}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.region}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
              Every child on 9jaWonderPal hears their own tradition first. A Yoruba child gets Yoruba proverbs.
              An Idoma child gets Idoma proverbs. Never mixed up.
            </p>
          </Screen>
        )}

        {step === 4 && (
          <Screen icon={<Heart size={40} />} title={"What does " + (childData.name || 'your child') + " love?"}
            subtitle="Optional — helps us suggest stories.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {INTEREST_OPTIONS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)}
                  style={{ padding: '10px 16px', fontSize: 13, borderRadius: 12, cursor: 'pointer',
                    background: childData.interests.includes(i) ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                    border: '2px solid ' + (childData.interests.includes(i) ? accent : 'transparent'),
                    color: '#e2e8f0', fontWeight: 600 }}>{i}</button>
              ))}
            </div>
            <div style={{ padding: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              You can add more children after this. Just click "Add another child" on the dashboard.
            </div>
          </Screen>
        )}

        {error && (
          <div style={{ marginTop: 20, padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 12, color: '#ef4444', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 40 }}>
          {step > 0 && (
            <button onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 22px', borderRadius: 14,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step === 0 && (
            <ActionButton label="Begin" onClick={next} />
          )}
          {step === 1 && (
            <ActionButton label="Create account" disabled={!stepDone()} onClick={() => { createParent(parentData); next(); }} />
          )}
          {step === 2 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <ActionButton label="Add this child" disabled={!stepDone()} onClick={() => { addCurrentChild(); next(); }} variant="secondary" />
              <ActionButton label="Continue" disabled={!stepDone() && !addedChildren.length} onClick={() => { next(); }} />
            </div>
          )}
          {step === 3 && (
            <ActionButton label="Continue" disabled={!stepDone()} onClick={next} />
          )}
          {step === 4 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <ActionButton label="Add another child" onClick={() => { addCurrentChild(); setStep(2); }} variant="secondary" />
              <ActionButton label="Finish setup" onClick={finish} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Screen({ icon, title, subtitle, children }) {
  return (
    <div>
      <div style={{ display: 'inline-flex', padding: 20, borderRadius: 24, background: 'rgba(255,183,0,0.15)', border: '1px solid rgba(255,183,0,0.4)', color: warm, marginBottom: 24 }}>
        {icon}
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', color: '#fff', letterSpacing: -0.4 }}>{title}</h1>
      <p style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 28px', lineHeight: 1.6 }}>{subtitle}</p>
      {children}
    </div>
  );
}

function ActionButton({ label, onClick, disabled, variant }) {
  const isSecondary = variant === 'secondary';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 26px', borderRadius: 14,
        background: disabled ? 'rgba(255,255,255,0.05)'
          : isSecondary ? 'rgba(255,255,255,0.06)'
          : 'linear-gradient(135deg, ' + warm + ', #ff6b00)',
        border: isSecondary ? '1px solid rgba(255,255,255,0.15)' : 'none',
        color: disabled ? '#64748b' : (isSecondary ? '#e2e8f0' : '#000'),
        fontSize: 15, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {label} <ArrowRight size={16} />
    </button>
  );
}
