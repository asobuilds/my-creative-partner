export const THEMES = {
  navy:     { name: 'Navy Classic', bg: '#0a0812', surface: 'rgba(15,12,26,0.7)',   primary: '#ffb700', accent: '#a78bfa', text: '#ffffff', textMuted: '#94a3b8', page: '#fafaf7', pageText: '#0a1f44', pageMuted: '#64748b' },
  dawn:     { name: 'Dawn',         bg: '#1a0e1a', surface: 'rgba(30,15,30,0.7)',   primary: '#ff8a4c', accent: '#f472b6', text: '#ffffff', textMuted: '#c4b5fd', page: '#fef6f0', pageText: '#7c2d12', pageMuted: '#9a3412' },
  forest:   { name: 'Forest',       bg: '#071410', surface: 'rgba(10,25,20,0.7)',   primary: '#4ade80', accent: '#22d3ee', text: '#ffffff', textMuted: '#86efac', page: '#f0fdf4', pageText: '#14532d', pageMuted: '#166534' },
  royal:    { name: 'Royal Purple', bg: '#0f0720', surface: 'rgba(20,10,40,0.7)',   primary: '#a78bfa', accent: '#f472b6', text: '#ffffff', textMuted: '#c4b5fd', page: '#faf5ff', pageText: '#581c87', pageMuted: '#7e22ce' },
  sunset:   { name: 'Sunset',       bg: '#1a0e08', surface: 'rgba(30,15,10,0.7)',   primary: '#fbbf24', accent: '#ef4444', text: '#ffffff', textMuted: '#fcd34d', page: '#fff7ed', pageText: '#7c2d12', pageMuted: '#9a3412' },
  ocean:    { name: 'Ocean',        bg: '#051424', surface: 'rgba(8,25,45,0.7)',    primary: '#22d3ee', accent: '#3b82f6', text: '#ffffff', textMuted: '#93c5fd', page: '#f0f9ff', pageText: '#0c4a6e', pageMuted: '#075985' },
};

export function applyTheme(key) {
  const t = THEMES[key] || THEMES.navy;
  const r = document.documentElement;
  Object.entries(t).forEach(([k, v]) => { if (k !== 'name') r.style.setProperty('--theme-' + k, v); });
  document.body.style.background = t.bg;
}

export function applyTextSize(scale) {
  document.documentElement.style.fontSize = (16 * scale) + 'px';
}

export function applyReduceMotion(on) {
  document.documentElement.style.setProperty('--motion-duration', on ? '0s' : '0.25s');
}
