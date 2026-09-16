import React from 'react';
import { Sparkles, Rocket, Zap, Shield, Layers } from 'lucide-react';

export default function LandingPage({ onLaunch, onOpenAuth }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="hover-glass-card" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.5))',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        padding: '40px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 240, 255, 0.12)', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#00f0ff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px' }}>
          <Sparkles size={14} /> Next-Gen AI Imagination Studio
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.2 }}>
          Bring Prompted Concepts to Life in Real-Time 3D
        </h1>
        <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '28px' }}>
          Design, simulate, and direct spatial entities powered by instant directives and glassmorphic UI controls.
        </p>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={onLaunch} style={{ background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', border: 'none', color: '#fff', padding: '14px 28px', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rocket size={18} /> Launch 3D Studio
          </button>
          <button onClick={onOpenAuth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 24px', borderRadius: '16px', fontWeight: 600, cursor: 'pointer' }}>
            Sign In / Register
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {[
          { icon: <Zap color="#00f0ff" />, title: 'Direct Controls', desc: 'Interact with smart spatial entities through modular action flows.' },
          { icon: <Layers color="#38bdf8" />, title: 'Glass Architecture', desc: 'Futuristic glassmorphic panels engineered for maximum visual contrast.' },
          { icon: <Shield color="#10b981" />, title: 'Local Persistence', desc: 'Your layout states and creative history persist across user sessions.' }
        ].map((feat, idx) => (
          <div key={idx} className="hover-glass-card" style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>{feat.icon}</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{feat.title}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
