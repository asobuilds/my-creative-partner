import React from 'react';
import { Sparkles, Box, Palette, Cpu } from 'lucide-react';

const ITEMS = [
  { type: 'prompt', label: 'Prompt', icon: <Sparkles size={15} />, data: { prompt: '' } },
  { type: 'model',  label: 'Mesh',   icon: <Box size={15} />,      data: { kind: 'box' } },
  { type: 'mood',   label: 'Mood',   icon: <Palette size={15} />,  data: { color: '#00f0ff' } },
  { type: 'output', label: 'Output', icon: <Cpu size={15} />,      data: {} },
];

export default function NodePalette({ compact }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      gap: 8,
      padding: compact ? '8px 10px' : 12,
      overflowX: compact ? 'auto' : 'visible',
    }}>
      {ITEMS.map((it) => (
        <div
          key={it.type}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/synthetix-node', JSON.stringify(it));
            e.dataTransfer.effectAllowed = 'move';
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 10, cursor: 'grab',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#cbd5e1', fontSize: 12, fontWeight: 600,
            whiteSpace: 'nowrap', userSelect: 'none',
          }}
        >
          <span style={{ color: '#00f0ff', display: 'flex' }}>{it.icon}</span>
          {it.label}
        </div>
      ))}
    </div>
  );
}