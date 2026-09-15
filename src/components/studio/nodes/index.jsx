import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, ChevronDown, ChevronRight, Loader2, Box, Palette, Cpu } from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';

/* ── Shared chrome ───────────────────────────────────── */
function Shell({ title, icon, accent = '#00f0ff', selected, children, streaming }) {
  return (
    <div style={{
      minWidth: 220,
      background: 'rgba(15,23,42,0.88)',
      backdropFilter: 'blur(18px)',
      border: `1px solid ${selected ? accent : 'rgba(255,255,255,0.12)'}`,
      boxShadow: selected ? `0 0 0 1px ${accent}, 0 12px 40px rgba(0,240,255,0.18)` : '0 8px 24px rgba(0,0,0,0.4)',
      borderRadius: 14,
      color: '#e2e8f0',
      fontSize: 12,
      overflow: 'hidden',
      transition: 'border-color .2s, box-shadow .2s',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: streaming ? 'rgba(0,240,255,0.08)' : 'transparent',
      }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span>
        <span style={{ fontWeight: 700, letterSpacing: 0.3, flex: 1 }}>{title}</span>
        {streaming && <Loader2 size={13} className="spin" color={accent} />}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function Disclosure({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none',
          border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 11,
          fontWeight: 600, padding: 0, letterSpacing: 0.3,
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />} {label}
      </button>
      {open && <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>}
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#94a3b8', letterSpacing: 0.4 }}>
      {label}
      <input
        {...props}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 8px', color: '#fff',
          outline: 'none', fontSize: 11,
        }}
      />
    </label>
  );
}

/* ── 1. Prompt Node ──────────────────────────────────── */
const PromptNode = memo(({ id, data, selected }) => {
  const patch = useStudioStore((s) => s.patchNodeData);
  const { send } = useStudioStore.getState(); // noop fallback; live send comes from hook

  return (
    <Shell title="Prompt" icon={<Sparkles size={14} />} selected={selected} streaming={data.isStreaming}>
      <Handle type="source" position={Position.Right} style={{ background: '#00f0ff', width: 9, height: 9 }} />
      <textarea
        value={data.prompt ?? ''}
        onChange={(e) => patch(id, { prompt: e.target.value })}
        placeholder="a childlike floating garden of light…"
        rows={3}
        style={{
          resize: 'none', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          padding: 8, color: '#fff', outline: 'none', fontSize: 11,
          fontFamily: 'inherit',
        }}
      />
      <Disclosure label="ADVANCED">
        <Field label="MODEL" defaultValue={data.model ?? 'auto'} onChange={(e) => patch(id, { model: e.target.value })} />
        <Field label="SEED" type="number" defaultValue={data.seed ?? 42} onChange={(e) => patch(id, { seed: +e.target.value })} />
        <Field label="TEMPERATURE" type="number" step="0.1" defaultValue={data.temp ?? 0.7} onChange={(e) => patch(id, { temp: +e.target.value })} />
      </Disclosure>
      {data.streamed && (
        <div style={{ fontSize: 10, color: '#7dd3fc', opacity: 0.8, borderTop: '1px dashed rgba(0,240,255,0.25)', paddingTop: 8 }}>
          {data.streamed.slice(-160)}
        </div>
      )}
    </Shell>
  );
});

/* ── 2. Model Node ───────────────────────────────────── */
const ModelNode = memo(({ id, data, selected }) => {
  const patch = useStudioStore((s) => s.patchNodeData);
  return (
    <Shell title="Mesh Generator" icon={<Box size={14} />} accent="#38bdf8" selected={selected} streaming={data.isStreaming}>
      <Handle type="target" position={Position.Left} style={{ background: '#38bdf8', width: 9, height: 9 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#38bdf8', width: 9, height: 9 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {['box', 'sphere', 'torus', 'cloud'].map((k) => (
          <button key={k} onClick={() => patch(id, { kind: k })}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 7, fontSize: 10, cursor: 'pointer',
              background: data.kind === k ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${data.kind === k ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
              color: '#fff',
            }}>{k}</button>
        ))}
      </div>
      <Disclosure label="LOD / SHADER">
        <Field label="SUBDIVISIONS" type="number" min="1" max="7" defaultValue={3} />
        <Field label="EMISSIVE" type="number" step="0.1" min="0" max="2" defaultValue={data.emissive ?? 0.35}
               onChange={(e) => patch(id, { emissive: +e.target.value })} />
      </Disclosure>
    </Shell>
  );
});

/* ── 3. Shader / Mood Node ───────────────────────────── */
const MoodNode = memo(({ id, data, selected }) => {
  const patch = useStudioStore((s) => s.patchNodeData);
  return (
    <Shell title="Mood & Palette" icon={<Palette size={14} />} accent="#a78bfa" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#a78bfa', width: 9, height: 9 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#a78bfa', width: 9, height: 9 }} />
      <input type="color" value={data.color ?? '#00f0ff'}
             onChange={(e) => patch(id, { color: e.target.value })}
             style={{ width: '100%', height: 30, background: 'transparent', border: 'none', cursor: 'pointer' }} />
      <Disclosure label="PHILOSOPHICAL TONE">
        <Field label="REFLECTION PROMPT" placeholder="What did you notice?" />
      </Disclosure>
    </Shell>
  );
});

/* ── 4. Output Node (renders into 3D) ────────────────── */
const OutputNode = memo(({ id, data, selected }) => (
  <Shell title="4K Viewport Out" icon={<Cpu size={14} />} accent="#10b981" selected={selected} streaming={data.isStreaming}>
    <Handle type="target" position={Position.Left} style={{ background: '#10b981', width: 9, height: 9 }} />
    <div style={{ fontSize: 10, color: '#6ee7b7' }}>
      {data.isStreaming ? 'Assembling…' : 'Live in viewport'}
    </div>
  </Shell>
));

export const nodeTypes = {
  prompt: PromptNode,
  model: ModelNode,
  mood: MoodNode,
  output: OutputNode,
};