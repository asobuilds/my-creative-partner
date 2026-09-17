import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export function useReference(prompt, { enabled = true, mode = 'auto' } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    setData(null);
    setError(null);
  }, [prompt]);

  useEffect(() => {
    if (!enabled || !prompt || dismissed) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const url = API + '/api/reference?q=' + encodeURIComponent(prompt) + '&mode=' + mode;
        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [prompt, enabled, mode, dismissed]);

  return { data, loading, error, dismissed, dismiss: () => setDismissed(true) };
}
