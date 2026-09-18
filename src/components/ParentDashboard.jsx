import React, { useState } from 'react';
import { useAccountStore } from '../store/accountStore';
import { User, Plus, LogOut, Settings } from 'lucide-react';

const warm = '#ffb700';

export default function ParentDashboard({ onClose }) {
  const parent = useAccountStore((s) => s.parent);
  const children = useAccountStore((s) => s.children);
  const activeChildId = useAccountStore((s) => s.activeChildId);
  const setActiveChild = useAccountStore((s) => s.setActiveChild);
  const deleteChild = useAccountStore((s) => s.deleteChild);
  const signOut = useAccountStore((s) => s.signOut);
  const [showAdd, setShowAdd] = useState(false);
  const [showControls, setShowControls] = useState(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
      overflowY: 'auto', padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>Parent account</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{parent?.name || 'Parent'}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{parent?.email}</div>
          </div>
          <button onClick={signOut} title="Sign out" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Your children ({children.length})</h2>
          <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg, ' + warm + ', #ff6b00)', border: 'none', color: '#000', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            <Plus size={14} /> Add child
          </button>
        </div>

        {children.map((c) => (
          <div key={c.id} style={{
            padding: 16, marginBottom: 10, borderRadius: 16,
            background: c.id === activeChildId ? 'rgba(255,183,0,0.12)' : 'rgba(255,255,255,0.04)',
            border: '1px solid ' + (c.id === activeChildId ? warm : 'rgba(255,255,255,0.08)'),
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {c.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {c.age} years · {c.culture ? c.culture.charAt(0).toUpperCase() + c.culture.slice(1) : 'Mixed'}
                {c.interests && c.interests.length ? ' · ' + c.interests.slice(0, 3).join(', ') : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {c.id !== activeChildId && (
                <button onClick={() => { setActiveChild(c.id); onClose && onClose(); }}
                  style={{ padding: '8px 14px', borderRadius: 10, background: warm, color: '#000', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Switch to
                </button>
              )}
              {c.id === activeChildId && (
                <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 700 }}>
                  Active
                </div>
              )}
              <button onClick={() => setShowControls(c.id)} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Controls</button>
              <button onClick={() => { if (confirm('Remove ' + c.name + '?')) deleteChild(c.id); }}
                style={{ padding: '8px 12px', borderRadius: 10, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', fontSize: 12, cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          </div>
        ))}

        {showAdd && <AddChildModal onClose={() => setShowAdd(false)} />}
        {showControls && (() => { const c = children.find((x) => x.id === showControls); return c ? <CredentialsPanel child={c} onClose={() => setShowControls(null)} /> : null; })()}

        <button onClick={onClose} style={{ marginTop: 24, width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}

function CredentialsPanel({ child, onClose }) {
  const toggleSubject = useAccountStore((s) => s.toggleSubject);
  const toggleMode = useAccountStore((s) => s.toggleMode);
  const regenerateCredentials = useAccountStore((s) => s.regenerateCredentials);
  const [revealed, setRevealed] = React.useState(false);
  const [creds, setCreds] = React.useState({ login: child.login, pin: child.pin });
  const subjects = [
    { key: 'english', name: 'English Studies', emoji: '📖' },
    { key: 'maths', name: 'Mathematics', emoji: '��' },
    { key: 'nigerian_language', name: 'Nigerian Language', emoji: '🗣️' },
    { key: 'basic_science', name: 'Basic Science', emoji: '🔬' },
    { key: 'phe', name: 'Physical & Health', emoji: '🏃' },
    { key: 'crs', name: 'Christian Religious Studies', emoji: '✝️' },
    { key: 'is', name: 'Islamic Studies', emoji: '☪️' },
    { key: 'history', name: 'Nigerian History', emoji: '🏛️' },
    { key: 'social', name: 'Social & Citizenship', emoji: '🌍' },
    { key: 'cca', name: 'Cultural & Creative Arts', emoji: '🎨' },
    { key: 'tech', name: 'Basic Sci & Tech', emoji: '⚙️' },
    { key: 'digital', name: 'Digital Literacy', emoji: '💻' },
    { key: 'prevoc', name: 'Pre-Vocational', emoji: '🛠️' },
  ];
  const modes = [
    { key: 'story', name: 'Story', emoji: '📖' },
    { key: 'folklore', name: 'Folklore', emoji: '📜' },
    { key: 'funfact', name: 'Fun Facts', emoji: '🧠' },
    { key: 'own', name: 'Make Your Own', emoji: '��' },
    { key: 'homework', name: 'Homework Helper', emoji: '✏️' },
  ];
  const enabledSubjects = new Set(child.enabledSubjects || []);
  const allowedModes = new Set(child.allowedModes || []);
  const regen = () => {
    if (!confirm('Generate a new username and PIN for ' + child.name + '? The old ones will stop working.')) return;
    const next = regenerateCredentials(child.id);
    if (next) setCreds(next);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 270, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', overflowY: 'auto', padding: 20 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', background: '#0f0c1a', border: '1px solid ' + warm + '55', borderRadius: 22, padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{child.avatar} {child.name}'s controls</h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{child.age} years · {child.culture}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Close</button>
        </div>

        {/* Credentials */}
        <div style={{ padding: 18, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: warm, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Login credentials</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 11, color: '#94a3b8' }}>Username</div><div style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{revealed ? creds.login : '••••••'}</div></div>
            <div><div style={{ fontSize: 11, color: '#94a3b8' }}>PIN</div><div style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'monospace', letterSpacing: 3 }}>{revealed ? creds.pin : '••••'}</div></div>
            <button onClick={() => setRevealed(!revealed)} style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{revealed ? 'Hide' : 'Show'}</button>
            <button onClick={regen} style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>New credentials</button>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>Share these with your child. They sign in on their own screen with just these two things. No email needed.</div>
        </div>

        {/* Subjects */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: warm, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>School subjects allowed</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {subjects.map((s) => (
              <button key={s.key} onClick={() => toggleSubject(child.id, s.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                  background: enabledSubjects.has(s.key) ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid ' + (enabledSubjects.has(s.key) ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.08)'),
                  color: enabledSubjects.has(s.key) ? '#86efac' : '#64748b', fontWeight: 600 }}>
                <span>{s.emoji}</span> {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Modes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: warm, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Creation modes allowed</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {modes.map((m) => (
              <button key={m.key} onClick={() => toggleMode(child.id, m.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                  background: allowedModes.has(m.key) ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid ' + (allowedModes.has(m.key) ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.08)'),
                  color: allowedModes.has(m.key) ? '#c4b5fd' : '#64748b', fontWeight: 600 }}>
                <span>{m.emoji}</span> {m.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{ width: '100%', padding: 14, borderRadius: 12, background: warm, color: '#000', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  );
}

function AddChildModal({ onClose }) {
  const addChild = useAccountStore((s) => s.addChild);
  const [data, setData] = useState({ name: '', age: 7, gender: 'unspecified', culture: 'mixed', avatar: '🌟', interests: [] });
  const cultures = ['yoruba', 'igbo', 'hausa', 'fulani', 'idoma', 'tiv', 'efik', 'ibibio', 'ijaw', 'edo', 'igala', 'nupe', 'kanuri', 'mixed'];
  const interestOptions = ['animals', 'space', 'stories', 'music', 'food', 'science', 'art', 'africa'];
  const inputStyle = { width: '100%', padding: '12px 14px', fontSize: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', outline: 'none' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 260, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 480, width: '100%', background: '#0f0c1a', border: '1px solid ' + warm + '55', borderRadius: 20, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>Add a child</h3>
        <input style={inputStyle} placeholder="Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        <div style={{ height: 10 }} />
        <input style={inputStyle} type="number" min={3} max={14} placeholder="Age" value={data.age} onChange={(e) => setData({ ...data, age: Number(e.target.value) })} />
        <div style={{ height: 10 }} />
        <select style={inputStyle} value={data.culture} onChange={(e) => setData({ ...data, culture: e.target.value })}>
          {cultures.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Interests</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {interestOptions.map((i) => (
            <button key={i} onClick={() => setData({ ...data, interests: data.interests.includes(i) ? data.interests.filter((x) => x !== i) : [...data.interests, i] })}
              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 10, cursor: 'pointer',
                background: data.interests.includes(i) ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                border: '1px solid ' + (data.interests.includes(i) ? '#a78bfa' : 'rgba(255,255,255,0.08)'),
                color: '#e2e8f0', fontWeight: 600 }}>{i}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!data.name} onClick={() => { addChild(data); onClose(); }}
            style={{ flex: 2, padding: '12px', borderRadius: 12, background: data.name ? 'linear-gradient(135deg, ' + warm + ', #ff6b00)' : 'rgba(255,255,255,0.05)', border: 'none', color: data.name ? '#000' : '#64748b', fontSize: 14, fontWeight: 800, cursor: data.name ? 'pointer' : 'not-allowed' }}>
            Add child
          </button>
        </div>
      </div>
    </div>
  );
}
