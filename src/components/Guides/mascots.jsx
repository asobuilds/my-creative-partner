import React from 'react';

/**
 * Simple, friendly mascot SVGs. Hand-drawn shapes, no external assets.
 * Every mascot is animated with CSS keyframes.
 */

/* Ìjàpá — the golden tortoise (main guide) */
export function Ijapa({ size = 80, mood = 'happy' }) {
  const eyeY = mood === 'sad' ? 38 : 36;
  const mouth = mood === 'happy'
    ? 'M 40 52 Q 50 60 60 52'
    : mood === 'sad'
      ? 'M 40 58 Q 50 50 60 58'
      : 'M 40 54 L 60 54';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="shellGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#ffd76e" />
          <stop offset="60%" stopColor="#f5a623" />
          <stop offset="100%" stopColor="#c47d0e" />
        </radialGradient>
        <linearGradient id="bellyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4d6" />
          <stop offset="100%" stopColor="#f5d194" />
        </linearGradient>
      </defs>
      {/* Legs */}
      <ellipse cx="28" cy="82" rx="8" ry="6" fill="#6b4423" />
      <ellipse cx="72" cy="82" rx="8" ry="6" fill="#6b4423" />
      {/* Body */}
      <ellipse cx="50" cy="70" rx="28" ry="14" fill="url(#bellyGrad)" stroke="#c47d0e" strokeWidth="2" />
      {/* Shell */}
      <ellipse cx="50" cy="55" rx="34" ry="24" fill="url(#shellGrad)" stroke="#8a5410" strokeWidth="2" />
      {/* Shell pattern */}
      <path d="M 30 48 Q 50 42 70 48" fill="none" stroke="#8a5410" strokeWidth="1.5" opacity="0.6" />
      <path d="M 26 60 Q 50 54 74 60" fill="none" stroke="#8a5410" strokeWidth="1.5" opacity="0.6" />
      <path d="M 40 36 L 40 76" fill="none" stroke="#8a5410" strokeWidth="1" opacity="0.4" />
      <path d="M 60 36 L 60 76" fill="none" stroke="#8a5410" strokeWidth="1" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="38" rx="16" ry="14" fill="#ffe9b3" stroke="#c47d0e" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="44" cy={eyeY} r="2.5" fill="#3d2817" />
      <circle cx="56" cy={eyeY} r="2.5" fill="#3d2817" />
      {/* Eye shine */}
      <circle cx="44.8" cy={eyeY - 0.8} r="0.8" fill="#fff" />
      <circle cx="56.8" cy={eyeY - 0.8} r="0.8" fill="#fff" />
      {/* Mouth */}
      <path d={mouth} fill="none" stroke="#3d2817" strokeWidth="1.8" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="38" cy="44" r="2.5" fill="#ffb1b1" opacity="0.7" />
      <circle cx="62" cy="44" r="2.5" fill="#ffb1b1" opacity="0.7" />
    </svg>
  );
}

/* Star — the wonder guide */
export function StarBuddy({ size = 80 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="starGrad" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#fff9b1" />
          <stop offset="70%" stopColor="#ffd76e" />
          <stop offset="100%" stopColor="#f5a623" />
        </radialGradient>
      </defs>
      <polygon
        points="50,8 60,38 92,38 66,58 76,90 50,70 24,90 34,58 8,38 40,38"
        fill="url(#starGrad)"
        stroke="#c47d0e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="46" r="2.5" fill="#3d2817" />
      <circle cx="58" cy="46" r="2.5" fill="#3d2817" />
      <circle cx="42.8" cy="45.2" r="0.8" fill="#fff" />
      <circle cx="58.8" cy="45.2" r="0.8" fill="#fff" />
      <path d="M 42 58 Q 50 66 58 58" fill="none" stroke="#3d2817" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="36" cy="54" r="2.5" fill="#ffb1b1" opacity="0.7" />
      <circle cx="64" cy="54" r="2.5" fill="#ffb1b1" opacity="0.7" />
    </svg>
  );
}

/* Drum — the rhythm guide */
export function TalkingDrum({ size = 80 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="drumGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c47d0e" />
          <stop offset="50%" stopColor="#8a5410" />
          <stop offset="100%" stopColor="#5c3708" />
        </linearGradient>
      </defs>
      {/* Drum body */}
      <path d="M 25 45 Q 25 85 50 85 Q 75 85 75 45 Z" fill="url(#drumGrad)" stroke="#3d2817" strokeWidth="2" />
      {/* Drum top */}
      <ellipse cx="50" cy="45" rx="25" ry="8" fill="#f5d194" stroke="#3d2817" strokeWidth="2" />
      {/* Straps */}
      <path d="M 28 55 L 72 60" fill="none" stroke="#3d2817" strokeWidth="1.5" />
      <path d="M 28 65 L 72 60" fill="none" stroke="#3d2817" strokeWidth="1.5" />
      {/* Eyes on top */}
      <circle cx="42" cy="44" r="2" fill="#3d2817" />
      <circle cx="58" cy="44" r="2" fill="#3d2817" />
      {/* Smile */}
      <path d="M 42 50 Q 50 55 58 50" fill="none" stroke="#3d2817" strokeWidth="1.5" strokeLinecap="round" />
      {/* Stick */}
      <line x1="70" y1="30" x2="82" y2="50" stroke="#3d2817" strokeWidth="2" strokeLinecap="round" />
      <circle cx="82" cy="50" r="3" fill="#f5a623" />
    </svg>
  );
}

export const MASCOTS = {
  ijapa: Ijapa,
  star: StarBuddy,
  drum: TalkingDrum,
};
