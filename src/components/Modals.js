import React, { useState } from 'react';
import { X } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuthSuccess({ email, username: username || email.split('@')[0] });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <h3 style={{ margin: '0 0 20px 0', color: '#00f0ff' }}>Sign In / Register</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }}
          />
          <input
            type="text"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }}
          />
          <button type="submit" style={{ background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', border: 'none', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <h3 style={{ margin: '0 0 20px 0', color: '#00f0ff' }}>Studio Settings</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Configure layout preferences and render quality settings.</p>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' }}>
          Close
        </button>
      </div>
    </div>
  );
}