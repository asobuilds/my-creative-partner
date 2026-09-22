import React, { useMemo } from 'react';

/**
 * WonderBackground — colorful animated background for children.
 * 5 variants:
 *   create    — warm orange/pink morning sky
 *   games     — playful teal/purple arcade
 *   story     — soft cream/gold storybook
 *   celebrate — bright party confetti
 *   calm      — soft lavender/mint (for reading, bedtime)
 *
 * Every variant is pure CSS + SVG. No images. 60fps on any device.
 */

const VARIANTS = {
  create: {
    base: 'linear-gradient(160deg, #fff4e6 0%, #ffe4cc 35%, #ffd1e0 100%)',
    shapeColor: '#ffb85c',
    shapeColor2: '#ff8fb1',
    accents: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2'],
  },
  games: {
    base: 'linear-gradient(160deg, #e0fbfc 0%, #c2e9fb 30%, #d5c6ff 100%)',
    shapeColor: '#22d3ee',
    shapeColor2: '#a78bfa',
    accents: ['#22d3ee', '#a78bfa', '#f472b6', '#facc15'],
  },
  story: {
    base: 'linear-gradient(160deg, #fdf6e3 0%, #fceecb 50%, #f8e6c9 100%)',
    shapeColor: '#f0b429',
    shapeColor2: '#e07a5f',
    accents: ['#f0b429', '#e07a5f', '#81b29a', '#3d405b'],
  },
  celebrate: {
    base: 'linear-gradient(160deg, #fff0f6 0%, #ffe0e9 40%, #ffeecb 100%)',
    shapeColor: '#ff5c8a',
    shapeColor2: '#ffb700',
    accents: ['#ff5c8a', '#ffb700', '#22d3ee', '#a78bfa'],
  },
  calm: {
    base: 'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 40%, #e6fffa 100%)',
    shapeColor: '#7c93e6',
    shapeColor2: '#7dd3c0',
    accents: ['#7c93e6', '#7dd3c0', '#c4b5fd', '#fbcfe8'],
  },
};

function Star({ cx, cy, r, color, delay }) {
  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: 'absolute', left: cx + '%', top: cy + '%',
        width: r * 2, height: r * 2, opacity: 0.55,
        animation: `wonderFloat ${6 + (delay % 3)}s ease-in-out ${delay}s infinite`,
        pointerEvents: 'none',
      }}
    >
      <polygon
        points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"
        fill={color}
      />
    </svg>
  );
}

function Blob({ cx, cy, size, color, delay }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: 'absolute', left: cx + '%', top: cy + '%',
        width: size, height: size, opacity: 0.35,
        animation: `wonderBlob ${14 + (delay % 6)}s ease-in-out ${delay}s infinite alternate`,
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }}
    >
      <path
        fill={color}
        d="M44.5,-58.7C57.5,-49.8,67.4,-35.5,71.4,-19.5C75.4,-3.5,73.6,14.2,66.3,29.5C59,44.8,46.2,57.8,31.3,64.5C16.4,71.2,-0.6,71.6,-17.4,67.4C-34.2,63.2,-50.8,54.4,-61.1,41.1C-71.4,27.8,-75.4,10.1,-73.7,-6.6C-72,-23.3,-64.6,-38.9,-53.1,-48.2C-41.6,-57.5,-26,-60.5,-10.6,-62.7C4.8,-64.9,19.4,-66.3,31.5,-67.6C43.6,-68.9,53.2,-70.1,44.5,-58.7Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function Cloud({ cx, cy, size, color, duration, delay }) {
  return (
    <div
      style={{
        position: 'absolute', top: cy + '%',
        left: '-20%',
        width: size, height: size * 0.5,
        animation: `wonderCloud ${duration}s linear ${delay}s infinite`,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="60" cy="55" rx="45" ry="30" fill={color} />
        <ellipse cx="100" cy="45" rx="55" ry="38" fill={color} />
        <ellipse cx="145" cy="55" rx="40" ry="28" fill={color} />
      </svg>
    </div>
  );
}

function Confetti({ color, left, delay, duration, rotate }) {
  return (
    <div
      style={{
        position: 'absolute', top: '-10%', left: left + '%',
        width: 10, height: 14,
        background: color,
        borderRadius: 2,
        transform: 'rotate(' + rotate + 'deg)',
        animation: 'wonderConfetti ' + duration + 's linear ' + delay + 's infinite',
        pointerEvents: 'none',
        opacity: 0.8,
      }}
    />
  );
}

export default function WonderBackground({ variant = 'create', children, fixed = true }) {
  const v = VARIANTS[variant] || VARIANTS.create;

  // Deterministic-ish random positions — stable per render, variety across mounts
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push({
        cx: (i * 8.5 + 3) % 95,
        cy: (i * 13 + 5) % 85,
        r: 6 + (i % 4) * 3,
        color: v.accents[i % v.accents.length],
        delay: i * 0.4,
      });
    }
    return arr;
  }, [v]);

  const blobs = useMemo(() => {
    return [
      { cx: -5, cy: 15, size: 320, color: v.shapeColor, delay: 0 },
      { cx: 75, cy: 55, size: 380, color: v.shapeColor2, delay: 2 },
      { cx: 35, cy: 85, size: 280, color: v.accents[0], delay: 4 },
    ];
  }, [v]);

  const clouds = useMemo(() => {
    return [
      { cy: 8, size: 220, color: '#ffffff', duration: 45, delay: 0 },
      { cy: 25, size: 160, color: '#ffffff', duration: 60, delay: 8 },
      { cy: 60, size: 180, color: '#fff8e7', duration: 55, delay: 20 },
    ];
  }, []);

  const confetti = useMemo(() => {
    if (variant !== 'celebrate' && variant !== 'games') return [];
    const arr = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        color: v.accents[i % v.accents.length],
        left: (i * 7.3) % 100,
        delay: (i * 0.6) % 8,
        duration: 6 + (i % 4),
        rotate: (i * 47) % 360,
      });
    }
    return arr;
  }, [variant, v]);

  return (
    <div
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        background: v.base,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Soft blobs */}
      {blobs.map((b, i) => <Blob key={'b' + i} {...b} />)}

      {/* Drifting clouds */}
      {clouds.map((c, i) => <Cloud key={'c' + i} {...c} />)}

      {/* Twinkling stars */}
      {stars.map((s, i) => <Star key={'s' + i} {...s} />)}

      {/* Confetti (only for celebrate/games) */}
      {confetti.map((c, i) => <Confetti key={'cf' + i} {...c} />)}

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'auto' }}>
        {children}
      </div>

      <style>{`
        @keyframes wonderFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(1.08); }
        }
        @keyframes wonderBlob {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px,-20px) scale(1.15); }
        }
        @keyframes wonderCloud {
          0% { transform: translateX(0); }
          100% { transform: translateX(140vw); }
        }
        @keyframes wonderConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="wonderFloat"], [style*="wonderBlob"], [style*="wonderCloud"], [style*="wonderConfetti"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
