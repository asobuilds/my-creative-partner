import React from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

export default function StreamEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: data?.active ? '#00f0ff' : 'rgba(148,163,184,0.5)',
          strokeWidth: data?.active ? 2.4 : 1.4,
          filter: data?.active ? 'drop-shadow(0 0 6px rgba(0,240,255,0.8))' : 'none',
          transition: 'stroke .25s, stroke-width .25s',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(0,240,255,0.35)',
            borderRadius: 6, padding: '1px 6px',
            fontSize: 9, color: '#7dd3fc', pointerEvents: 'none',
          }}>{data.label}</div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}