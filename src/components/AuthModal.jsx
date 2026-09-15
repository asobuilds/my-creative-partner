import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuthSuccess({ email, username: username || email.split('@')[0] });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div className="hover-glass-card" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '420px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'inline-flex', padding: '8px', background: 'rgba(0, 240, 255, 0.15)', borderRadius: '12px', marginBottom: '16px' }}>
          <Sparkles size={20} color="#00f0ff" />
        </div>

        <h3 style={{ fontSize: '1.4rem', margin: '0 0 6px 0', textTransform: 'capitalize' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '24px' }}>Access your spatial workspace & saved models.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0 12px' }}>
              <User size={16} color="#9ca3af" />
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px', color: '#fff', outline: 'none' }} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0 12px' }}>
            <Mail size={16} color="#9ca3af" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px', color: '#fff', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0 12px' }}>
            <Lock size={16} color="#9ca3af" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px', color: '#fff', outline: 'none' }} />
          </div>

          <button type="submit" style={{ background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
            {mode === 'login' ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer' }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register here' : 'Already have an account? Sign In'}
        </div>
      </div>
    </div>
  );
}
