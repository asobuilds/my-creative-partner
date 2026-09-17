import React, { useEffect, useState } from 'react';
import { Search, X, Loader2, Plus } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export default function ImageSearchPanel({ open, onClose, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const mood = useStudioStore((s) => s.mood);
  const upsertSceneObject = useStudioStore((s) => s.upsertSceneObject);
  const sceneObjects = useStudioStore((s) => s.sceneObjects);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const search = async (q) => {
    const clean = String(q || '').trim();
    if (!clean) return;
    setLoading(true);
    try {
      const res = await fetch(API + '/api/image-search?q=' + encodeURIComponent(clean));
      const json = await res.json();
      setResults(json.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToScene = (img) => {
    const id = 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const offset = sceneObjects.length * 1.4;
    upsertSceneObject({
      id,
      kind: 'image',
      imageUrl: img.src,
      thumb: img.thumb,
      title: img.title,
      position: [offset - 1.4, 1, 0],
      rotation: [0, 0, 0],
      scale: 1.5,
    });
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: 'min(380px, 92vw)',
      background: 'rgba(10,8,18,0.97)',
      backdropFilter: 'blur(24px)',
      borderLeft: '1px solid ' + mood.primary + '44',
      zIndex: 35, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, color: mood.primary, fontWeight: 800, fontSize: 14 }}>Find an image</div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); search(query); }}
        style={{ padding: 14, display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="lion, tree, castle..."
          style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', outline: 'none', fontSize: 13 }}
        />
        <button type="submit" style={{ padding: '10px 14px', background: mood.primary, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          <Search size={14} />
        </button>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: mood.primary }}>
            <Loader2 size={20} className="spin" />
          </div>
        )}
        {!loading && results.length === 0 && (
          <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', padding: 30 }}>
            Type something and press search
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {results.map((img) => (
            <div key={img.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img
                src={img.thumb}
                alt={img.title}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
              <button
                onClick={() => addToScene(img)}
                style={{ width: '100%', padding: '8px', background: mood.primary, color: '#000', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Plus size={11} /> Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
