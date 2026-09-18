/**
 * Global audio queue — only one narration plays at a time.
 * Storybook pages register their play() here; starting a new one stops the previous.
 */
let currentAudio = null;

export function playExclusive(audio, onEnd) {
  if (currentAudio && currentAudio !== audio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
  }
  currentAudio = audio;
  audio.onended = () => { if (currentAudio === audio) currentAudio = null; if (onEnd) onEnd(); };
  audio.play().catch(() => {});
  return audio;
}

export function stopAll() {
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
    currentAudio = null;
  }
}
