import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class RootBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error('ROOT_CRASH:', err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ minHeight: '100vh', background: '#090d16', color: '#e2e8f0', padding: 40, fontFamily: 'system-ui' }}>
          <h1 style={{ color: '#00f0ff', marginBottom: 12 }}>Studio hit an error</h1>
          <p style={{ color: '#94a3b8', marginBottom: 20, maxWidth: 600 }}>{String(this.state.err && this.state.err.message || this.state.err)}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#00f0ff,#3b82f6)', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<RootBoundary><App /></RootBoundary>);
