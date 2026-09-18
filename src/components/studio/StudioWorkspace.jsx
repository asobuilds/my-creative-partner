import React, { useEffect, useState } from 'react';
import SpatialViewport from './SpatialViewport';
import FlowCanvas from './FlowCanvas';
import NodePalette from './NodePalette';
import HUD from './HUD';
import CompanionOverlay from './CompanionOverlay';
import RenderPreview from './RenderPreview';
import ImageSearchPanel from './ImageSearchPanel';
import BookView from './BookView';
import { useResponsive } from '../../hooks/useResponsive';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import { startMoodSync } from '../../engine/moodEngine';
import { useStudioStore } from '../../store/studioStore';
import { Layers, Sliders, ScrollText } from 'lucide-react';

function useSearchState() {
  const [showSearch, setShowSearch] = useState(false);
  return { showSearch, setShowSearch };
}

function useBoot() {
  const { engine, cancel } = usePromptEngine();
  const streamStatus = useStudioStore((s) => s.streamStatus);
  useEffect(() => startMoodSync(), []);
  return { engine, cancel, streamStatus };
}

function DesktopLayout({ engine, cancel, streamStatus, showSearch, setShowSearch }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 420px', height: '100%' }}>
      <aside style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.55)' }}>
        <NodePalette />
      </aside>
      <main style={{ position: 'relative' }}>
        <BookView />
        <HUD engine={engine} cancel={cancel} streamStatus={streamStatus} />
        <CompanionOverlay />
        <RenderPreview />
        <button onClick={() => setShowSearch(true)} title="Find an image" style={{ position: 'absolute', top: 74, right: 24, zIndex: 19, width: 44, height: 44, borderRadius: 12, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(0,240,255,0.5)', color: '#00f0ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20 }}>+</span>
        </button>
        <ImageSearchPanel open={showSearch} onClose={() => setShowSearch(false)} initialQuery="" />
      </main>
      <aside style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', background: 'rgba(9,13,22,0.65)' }}>
        <FlowCanvas />
      </aside>
    </div>
  );
}

function TabletLayout({ engine, cancel, streamStatus }) {
  const [split, setSplit] = useState(60);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: '0 0 ' + split + '%', position: 'relative', minHeight: 220 }}>
        <SpatialViewport className="viewport" />
        <HUD compact engine={engine} cancel={cancel} streamStatus={streamStatus} />
        <CompanionOverlay />
        <RenderPreview />
      </div>
      <div
        onPointerDown={(e) => {
          const startY = e.clientY, startSplit = split;
          const move = (ev) => setSplit(Math.min(80, Math.max(25, startSplit + ((ev.clientY - startY) / window.innerHeight) * 100)));
          const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
          window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
        }}
        style={{ height: 10, cursor: 'row-resize', background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.35), transparent)' }}
      />
      <div style={{ flex: 1, minHeight: 160, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <FlowCanvas />
      </div>
    </div>
  );
}

function MobileLayout({ engine, cancel, streamStatus }) {
  const [sheet, setSheet] = useState(null);
  const activeNode = useStudioStore((s) => s.nodes.find((n) => n.id === s.activeNodeId));
  const events = useStudioStore((s) => s.events);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <SpatialViewport className="viewport" />
      <HUD compact engine={engine} cancel={cancel} streamStatus={streamStatus} />
      <CompanionOverlay />
      <RenderPreview />

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '10px 12px 14px',
        background: 'linear-gradient(to top, rgba(9,13,22,0.95), transparent)',
        pointerEvents: 'none',
      }}>
        {[
          { id: 'graph', icon: <Layers size={16} />, label: 'Graph' },
          { id: 'inspector', icon: <Sliders size={16} />, label: 'Inspect' },
          { id: 'log', icon: <ScrollText size={16} />, label: 'Log' },
        ].map((t) => (
          <button key={t.id} onClick={() => setSheet((s) => (s === t.id ? null : t.id))}
            style={{
              pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 22,
              background: sheet === t.id ? 'rgba(0,240,255,0.22)' : 'rgba(15,23,42,0.85)',
              border: '1px solid ' + (sheet === t.id ? 'rgba(0,240,255,0.6)' : 'rgba(255,255,255,0.12)'),
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(14px)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '62vh',
        transform: sheet ? 'translateY(0)' : 'translateY(102%)',
        transition: 'transform .32s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(9,13,22,0.97)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0,240,255,0.35)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', zIndex: 40,
      }}>
        <div style={{ height: 4, width: 42, borderRadius: 4, background: 'rgba(255,255,255,0.25)', margin: '10px auto 0' }} />
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <NodePalette compact />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {sheet === 'graph' && <FlowCanvas />}
          {sheet === 'inspector' && (
            <div style={{ padding: 16, fontSize: 12, color: '#cbd5e1' }}>
              {activeNode
                ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{JSON.stringify(activeNode.data, null, 2)}</pre>
                : <p style={{ opacity: 0.6 }}>Tap a node to inspect it.</p>}
            </div>
          )}
          {sheet === 'log' && (
            <div style={{ padding: 12, overflowY: 'auto', height: '100%', fontFamily: 'monospace', fontSize: 10 }}>
              {events.map((e, i) => (
                <div key={i} style={{ color: '#7dd3fc', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {e.type} {e.id ? ' - ' + e.id : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudioWorkspace() {
  const { engine, cancel, streamStatus } = useBoot();
  const { mode } = useResponsive();
  const props = { engine, cancel, streamStatus };
  if (mode === 'mobile') return <MobileLayout {...props} />;
  if (mode === 'tablet') return <TabletLayout {...props} />;
  return <DesktopLayout {...props} />;
}
