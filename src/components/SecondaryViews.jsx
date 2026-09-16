import React from 'react';
import { Rocket } from 'lucide-react';

export function InspirationView({ setPromptInput, setActiveTab }) {
  const ideas = [
    'Cyberpunk Neon Cube',
    'Golden Floating Sphere',
    'Spatial Hologram',
    'Futuristic Matrix Text',
  ];
  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#00f0ff' }}>Idea Stream</h2>
      <p style={{ color: '#9ca3af' }}>Select a prompt preset to generate directly into the 3D Studio Canvas:</p>
      <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
        {ideas.map((idea, idx) => (
          <div key={idx}
            onClick={() => { if (setPromptInput) setPromptInput(idea); if (setActiveTab) setActiveTab('canvas'); }}
            style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{idea}</span>
            <Rocket size={16} color="#00f0ff" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardView() {
  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ color: '#00f0ff' }}>Top Spatial Designers</h2>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {['User_Alpha - 1,420 Renders', 'CyberArchitect - 980 Renders', 'NeoMatrix - 750 Renders'].map((rank, i) => (
          <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>{i + 1}. {rank}</div>
        ))}
      </div>
    </div>
  );
}

export function FeedbackView() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <h2 style={{ color: '#00f0ff' }}>Submit Studio Feedback</h2>
      <textarea placeholder="Describe your experience or feature request..."
        style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px', padding: '12px', margin: '16px 0' }} />
      <button style={{ background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
    </div>
  );
}

export function FAQView() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      <h2 style={{ color: '#00f0ff' }}>Frequently Asked Questions</h2>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4>How do I render 3D Text?</h4>
          <p style={{ color: '#9ca3af' }}>Type any prompt or phrase into the HUD bar in the 3D Studio Canvas view.</p>
        </div>
        <div>
          <h4>How does Voice Directing work?</h4>
          <p style={{ color: '#9ca3af' }}>Click the Microphone icon on the HUD to dictate color and geometry prompts directly.</p>
        </div>
      </div>
    </div>
  );
}

export function ProfileView({ currentUser, setCurrentUser }) {
  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ color: '#00f0ff' }}>User Profile</h2>
      {currentUser ? (
        <div>
          <p><strong>Username:</strong> {currentUser.username}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <button onClick={() => setCurrentUser(null)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' }}>Sign Out</button>
        </div>
      ) : (
        <p>Please log in to view profile details.</p>
      )}
    </div>
  );
}
