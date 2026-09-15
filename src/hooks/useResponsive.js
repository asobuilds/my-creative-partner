import { useEffect, useState } from 'react';

export const BP = { MOBILE: 768, DESKTOP: 1440 };

function readViewport() {
  if (typeof window === 'undefined') return { width: 1440, height: 900, dpr: 1 };
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  };
}

function classify(w) {
  if (w < BP.MOBILE) return 'mobile';
  if (w < BP.DESKTOP) return 'tablet';
  return 'desktop';
}

export function useResponsive() {
  const [state, setState] = useState(() => {
    const v = readViewport();
    const mode = classify(v.width);
    return { ...v, mode, isMobile: mode === 'mobile', isTablet: mode === 'tablet', isDesktop: mode === 'desktop' };
  });

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const v = readViewport();
      setState((prev) => {
        const mode = classify(v.width);
        if (prev.width === v.width && prev.height === v.height && prev.dpr === v.dpr && prev.mode === mode) return prev;
        return { ...v, mode, isMobile: mode === 'mobile', isTablet: mode === 'tablet', isDesktop: mode === 'desktop' };
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return state;
}