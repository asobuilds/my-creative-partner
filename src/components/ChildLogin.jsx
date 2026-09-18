import React, { useState } from 'react';
import { useAccountStore } from '../store/accountStore';
import { Sparkles, Lock, User } from 'lucide-react';

const NAVY = '#0a1f44';
const GOLD = '#f59e0b';

export default function ChildLogin({ onClose }) {
  const children = useAccountStore((s) => s.children);
  const [login, setLogin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const childLogin = useAccountStore((s) => s.childLogin);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    const child = childLogin(login.trim().toLowerCase(), pin.trim());
    if (!child) { setError('Hmm, that did not match. Ask your parent to check your username and PIN.'); return; }
    onClose && onClose();
  };

  const quick = (c) => {
    setLogin(c.login);
    setPin('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 350, background: 'radial-gradient(circle at 50% 30%, #1a1230 0%, #0a0812 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: 20, background: GOLD + '22', border: '1px solid ' + GOLD + '55', color: GOLD, marginBottom: 14 }}>
            <Sparkles size={26} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 6px' }}>Hi again!</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Your parent gave you a username and a 4-digit PIN.</p>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Username</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 14, marginBottom: 14 }}>
            <User size={16} color="#64748b" />
            <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="ada123" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: NAVY, fontSize: 16, fontWeight: 700 }} />
          </div>

          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>4-digit PIN</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 14, marginBottom: 20 }}>
            <Lock size={16} color="#64748b" />
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="• • • •" inputMode="numeric" maxLength={4}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: NAVY, fontSize: 20, fontWeight: 800, letterSpacing: 6 }} />
          </div>

          {error && (
            <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          <button type="submit" disabled={!login || pin.length !== 4}
            style={{ width: '100%', padding: 16, borderRadius: 14, background: (login && pin.length === 4) ? NAVY : '#cbd5e1', color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: (login && pin.length === 4) ? 'pointer' : 'not-allowed' }}>
            Enter
          </button>
        </form>

        {children.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Quick pick</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {children.map((c) => (
                <button key={c.id} onClick={() => quick(c)} type="button"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: NAVY, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <span style={{ fontSize: 16 }}>{c.avatar}</span> {c.name}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>Tap a name to fill the username. Then enter your PIN.</div>
          </div>
        )}

        <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 12, background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Not now
        </button>
      </div>
    </div>
  );
}
