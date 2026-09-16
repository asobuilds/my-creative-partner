import { useEffect, useRef, useCallback } from 'react';
import { StreamClient } from '../services/streamService';
import { useStudioStore } from '../store/studioStore';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

function toRenderUrl(p) {
  if (!p) return null;
  if (/^https?:\/\//.test(p)) return p;
  const idx = p.indexOf('/synthetix-renders/');
  if (idx === -1) return null;
  return API_BASE + '/renders/' + p.slice(idx + '/synthetix-renders/'.length);
}

export function useStreamingClient({ enabled = true, path } = {}) {
  const clientRef = useRef(null);
  const pathResolved = path || import.meta.env.VITE_STREAM_PATH || '/api/stream';

  useEffect(() => {
    if (!enabled) return;
    const store = useStudioStore.getState;

    const client = new StreamClient({
      path: pathResolved,
      onStatus: (s) => store().setStreamStatus(s),
      onError: (e) => store().pushEvent({ type: 'transport-error', message: String((e && e.message) || e) }),
      onMessage: (msg) => {
        const s = store();
        s.pushEvent(msg);
        switch (msg.type) {
          case 'phase': s.setPhase(msg.phase); break;
          case 'token': {
            const node = s.nodes.find((n) => n.id === msg.id);
            const prev = (node && node.data && node.data.streamed) || '';
            s.patchNodeData(msg.id, { streamed: prev + (msg.delta || ''), isStreaming: true });
            break;
          }
          case 'node:add': { const nn = msg.node || {}; nn.id = nn.id || ('n-' + Date.now() + '-' + Math.random().toString(36).slice(2,6)); nn.type = nn.type || 'prompt'; nn.position = (nn.position && typeof nn.position.x === 'number' && typeof nn.position.y === 'number') ? nn.position : { x: 80 + Math.random() * 500, y: 120 + Math.random() * 260 }; nn.data = nn.data || {}; s.addNode(nn); break; }
          case 'node:patch': s.patchNodeData(msg.id, msg.data); break;
          case 'edge:add':
            useStudioStore.setState((prev) => ({ edges: [...prev.edges, msg.edge] }));
            break;
          case 'scene:upsert': s.upsertSceneObject(msg.object); break;
          case 'scene:clear': s.clearScene(); break;
          case 'render:done':
            useStudioStore.setState({
              lastRender: {
                preview: toRenderUrl(msg.preview),
                glb: toRenderUrl(msg.glb),
                texture: msg.texture || null,
                ts: Date.now(),
              },
            });
            break;
          case 'done': s.patchNodeData(msg.id, { isStreaming: false }); break;
          case 'error':
            if (msg.id) s.patchNodeData(msg.id, { isStreaming: false, error: msg.message });
            s.pushEvent({ type: 'server-error', message: msg.message });
            break;
          case 'companion:start': s.companionStart(); break;
          case 'companion:token': s.companionToken(msg.delta); break;
          case 'companion:done': s.companionDone(msg.text); break;
          default: break;
        }
      },
    });

    client.connect();
    clientRef.current = client;
    return () => client.close();
  }, [enabled, pathResolved]);

  const send = useCallback((payload) => clientRef.current && clientRef.current.send(payload), []);
  const cancel = useCallback(() => clientRef.current && clientRef.current.send({ type: 'graph:cancel' }), []);
  return { send, cancel };
}
