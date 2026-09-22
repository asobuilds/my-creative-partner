import React, { useState } from 'react';
import { useAccountStore } from '../store/accountStore';
import { Sparkles, Lock, User, ArrowLeft } from 'lucide-react';

const GOLD = '#ffb700';

export default function KidsLogin({ open, onSuccess, onClose, onBack }) {
  const children = useAccountStore((s) => s.children);
  const [login, setLogin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const childLogin = useAccountStore((s) => s.childLogin);

  if (open === false) return null;

  const quickPick = (c) => { setLogin(c.login); setPin(''); setError(null); };

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    const child = childLogin(login.trim().toLowerCase(), pin.trim());
    if (!child) { setError('Hmm, that did not match. Ask your parent to check.'); return; }
    if (onSuccess) onSuccess(child);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 350, background: 'radial-gradient(circle at 50% 30%, #1a1230 0%, #0a0812 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#fff', borderRadius: 28, padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
        {(onBack || onClose) && (
          <button onClick={onClose || onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: 22, background: GOLD + '22', border: '1px solid ' + GOLD + '55', color: GOLD, marginBottom: 16 }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a1f44', margin: '0 0 8px' }}>Hi again!</h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Use the username and PIN your parent gave you.</p>
        </div>
        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#0a1f44', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Username</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, marginBottom: 14 }}>
            <User size={16} color="#64748b" />
            <input value={login} onChange={(e) => { setLogin(e.target.value); setError(null); }} placeholder="ada123" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#0a1f44', fontSize: 16, fontWeight: 700 }} />
          </div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#0a1f44', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>4-digit PIN</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, marginBottom: 20 }}>
            <Lock size={16} color="#64748b" />
            <input value={pin} onChange={(e) => { setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4)); setError(null); }} placeholder="••••" inputMode="numeric" maxLength={4}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#0a1f44', fontSize: 22, fontWeight: 800, letterSpacing: 8 }} />
          </div>
          {error && <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={!login || pin.length !== 4}
            style={{ width: '100%', padding: 18, borderRadius: 16, background: (login && pin.length === 4) ? 'linear-gradient(135deg, #0a1f44, #1e3a8a)' : '#cbd5e1', color: '#fff', border: 'none', fontSize: 17, fontWeight: 800, cursor: (login && pin.length === 4) ? 'pointer' : 'not-allowed' }}>
            Enter
          </button>
        </form>
        {children.length > 0 && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>Tap your name</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {children.map((c) => (
                <button key={c.id} onClick={() => quickPick(c)} type="button"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0a1f44', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{c.avatar}</span> {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
