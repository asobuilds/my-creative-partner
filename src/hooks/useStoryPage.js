import { useState } from 'react';
import { useStudioStore } from '../store/studioStore';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export function useStoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const addPage = useStudioStore((s) => s.addPage);
  const addSticker = useStudioStore((s) => s.addSticker);

  const createPage = async (prompt, profile = {}) => {
    const clean = String(prompt || '').trim();
    if (!clean) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API + '/api/story/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: clean,
          childName: profile.childName || null,
          childAge: profile.childAge || null,
          culture: profile.culture || 'mixed',
          interests: profile.interests || [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Page generation failed: ' + res.status);
      }
      const page = await res.json();
      if (page && page.ok) {
        addPage(page);
        if (page.sticker) addSticker(page.sticker);
        return page;
      }
      return null;
    } catch (e) {
      setError(String(e.message || e));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPage, loading, error };
}
