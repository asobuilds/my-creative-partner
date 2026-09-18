import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');
const CACHE_KEY = '9jawonderpal.location.v1';

export function useLocation() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) return;   // cached — don't re-fetch
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(API + '/api/location/lookup');
        const j = await r.json();
        if (!cancelled) {
          setData(j);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(j)); } catch (e) {}
        }
      } catch (e) {
        if (!cancelled) setData({ ok: false, error: 'unavailable' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [data]);

  return { location: data, loading };
}
