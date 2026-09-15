import { useEffect, useRef } from 'react';
import { useStudioStore } from '../store/studioStore';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function fetchAudio(text) {
  const res = await fetch(API + '/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('tts failed ' + res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function useCompanionVoice() {
  const text = useStudioStore((s) => s.companion.text);
  const streaming = useStudioStore((s) => s.companion.streaming);
  const muted = useStudioStore((s) => s.voiceMuted);
  const audioRef = useRef(null);
  const lastPlayedRef = useRef('');

  useEffect(() => {
    if (streaming) return;
    if (!text || text.length < 3) return;
    if (muted) return;
    if (lastPlayedRef.current === text) return;
    lastPlayedRef.current = text;

    let cancelled = false;
    (async () => {
      try {
        const url = await fetchAudio(text);
        if (cancelled) return;
        if (audioRef.current) { try { audioRef.current.pause(); } catch (e) {} }
        const audio = new Audio(url);
        audioRef.current = audio;
        await audio.play().catch(() => {});
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [text, streaming, muted]);

  const replay = async () => {
    if (!text || muted) return;
    try {
      const url = await fetchAudio(text);
      if (audioRef.current) { try { audioRef.current.pause(); } catch (e) {} }
      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play().catch(() => {});
    } catch (e) {}
  };

  const stop = () => { if (audioRef.current) { try { audioRef.current.pause(); } catch (e) {} } };

  return { replay, stop };
}
