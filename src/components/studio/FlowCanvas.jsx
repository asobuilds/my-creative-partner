import React, { useCallback, useRef } from 'react';
import {
  ReactFlow, Background, BackgroundVariant, Controls, MiniMap,
  ReactFlowProvider, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStudioStore } from '../../store/studioStore';
import { nodeTypes } from './nodes';
import StreamEdge from './StreamEdge';
import { useResponsive } from '../../hooks/useResponsive';

const edgeTypes = { stream: StreamEdge };

function FlowInner() {
  const wrapper = useRef(null);
  const { isMobile } = useResponsive();
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useStudioStore((s) => s.nodes);
  const edges = useStudioStore((s) => s.edges);
  const onNodesChange = useStudioStore((s) => s.onNodesChange);
  const onEdgesChange = useStudioStore((s) => s.onEdgesChange);
  const onConnect = useStudioStore((s) => s.onConnect);
  const addNode = useStudioStore((s) => s.addNode);
  const setActiveNodeId = useStudioStore((s) => s.setActiveNodeId);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/synthetix-node');
    if (!raw) return;
    const spec = JSON.parse(raw);
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNode({ id: `${spec.type}-${Date.now()}`, type: spec.type, position, data: spec.data ?? {} });
  }, [addNode, screenToFlowPosition]);

  return (
    <div ref={wrapper} style={{ width: '100%', height: '100%' }}
         onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, n) => setActiveNodeId(n.id)}
        onPaneClick={() => setActiveNodeId(null)}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'stream', animated: true }}
        fitView
        minZoom={0.2}
        maxZoom={2}
        panOnScroll
        selectionOnDrag={!isMobile}
        /* Gesture-first on touch devices */
        zoomOnPinch
        zoomOnDoubleClick={!isMobile}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#1e293b" />
        <Controls showInteractive={false} position={isMobile ? 'bottom-right' : 'bottom-left'} />
        {!isMobile && (
          <MiniMap pannable zoomable
            style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,240,255,0.25)' }}
            nodeColor={() => '#00f0ff'} maskColor="rgba(9,13,22,0.7)" />
        )}
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}