import { useEffect, useMemo, useRef, useState } from 'react';
import { VoiceEngine } from '../engine/voiceEngine';
import { useStudioStore } from '../store/studioStore';

const AUTOSUBMIT = (import.meta.env.VITE_VOICE_AUTOSUBMIT || 'false') === 'true';

export function useVoicePrompt({ onFinal } = {}) {
  const setPromptInput = useStudioStore((s) => s.setPromptInput);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const [lastCaptured, setLastCaptured] = useState(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const engine = useMemo(
    () =>
      new VoiceEngine({
        lang: import.meta.env.VITE_VOICE_LANG || (typeof navigator !== 'undefined' && navigator.language) || 'en-US',
        interim: (import.meta.env.VITE_VOICE_INTERIM || 'true') !== 'false',
        wakeWord: import.meta.env.VITE_VOICE_WAKE_WORD || '',
      }),
    []
  );

  useEffect(() => {
    setSupported(engine.supported);
    if (!engine.supported) return;

    const offStart = engine.on('start', () => setListening(true));
    const offEnd = engine.on('end', () => setListening(false));
    const offErr = engine.on('error', (e) => setError(e.code));

    const unbind = engine.bind(
      (text) => {
        if (!text) return;

        setPromptInput(text);
        setLastCaptured({ text, ts: Date.now() });

        if (!AUTOSUBMIT) {
          engine.stop();
        }

        if (onFinalRef.current) onFinalRef.current(text);
      },
      (interim) => setPromptInput(interim)
    );

    return () => { offStart(); offEnd(); offErr(); unbind(); engine.abort(); };
  }, [engine, setPromptInput]);

  const toggle = () => {
    if (listening) engine.stop();
    else { setError(null); engine.start(); }
  };

  const clearCaptured = () => setLastCaptured(null);

  return { listening, supported, error, toggle, engine, lastCaptured, clearCaptured, autoSubmit: AUTOSUBMIT };
}
