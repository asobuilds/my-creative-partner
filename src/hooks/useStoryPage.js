import { useState } from 'react';
import { useStudioStore } from '../store/studioStore';
import { useGamificationStore } from '../store/gamificationStore';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

export function useStoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const addPage = useStudioStore((s) => s.addPage);
  const addSticker = useStudioStore((s) => s.addSticker);
  const recordPage = useGamificationStore((s) => s.recordPage);

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
          mode: profile.mode || 'story',
          childName: profile.childName || null,
          childGender: profile.childGender || null,
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
        if (profile.childId) {
          const r = recordPage(profile.childId, profile.mode || 'story');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('wonderpal:points-earned', { detail: r }));
          }
        }
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
