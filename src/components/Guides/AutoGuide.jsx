import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/accountStore';
import MascotGuide from './MascotGuide';
import { GUIDES, hasSeenGuide, markGuideSeen } from '../../engine/guideEngine';

/**
 * AutoGuide — renders a mascot guide if the child hasn't seen it yet.
 * Usage: <AutoGuide guideKey="first-visit-create" />
 */
export default function AutoGuide({ guideKey, delayMs = 800, autoHideMs = 0 }) {
  const activeChild = useAccountStore((s) => s.getActiveChild());
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!guideKey || !activeChild || !activeChild.id) return;
    if (hasSeenGuide(activeChild.id, guideKey)) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [guideKey, activeChild]);

  if (!show) return null;

  const guide = GUIDES[guideKey];
  if (!guide) return null;

  const dismiss = () => {
    setShow(false);
    if (activeChild && activeChild.id) markGuideSeen(activeChild.id, guideKey);
  };

  return (
    <MascotGuide
      mascot={guide.mascot}
      message={guide.message}
      position={guide.position}
      autoHide={autoHideMs}
      onDismiss={dismiss}
    />
  );
}
