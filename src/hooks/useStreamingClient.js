import { useEffect, useRef, useCallback } from 'react';
import { StreamClient } from '../services/streamService';
import { useStudioStore } from '../store/studioStore';

/**
 * Wire protocol (JSON):
 *   { type: 'token',        id, delta }
 *   { type: 'node:add',     node }
 *   { type: 'node:patch',   id, data }
 *   { type: 'edge:add',     edge }
 *   { type: 'scene:upsert', object }
 *   { type: 'scene:clear' }
 *   { type: 'done',         id }
 *   { type: 'error',        message }
 */
export function useStreamingClient({ enabled = true, path = '/api/stream' } = {}) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const store = useStudioStore.getState;

    const client = new StreamClient({
      path,
      onStatus: (s) => store().setStreamStatus(s),
      onError: (e) => store().pushEvent({ type: 'transport-error', message: String(e?.message ?? e) }),
      onMessage: (msg) => {
        const s = store();
        s.pushEvent(msg);

        switch (msg.type) {
          case 'token': {
            const node = s.nodes.find((n) => n.id === msg.id);
            const prev = node?.data?.streamed ?? '';
            s.patchNodeData(msg.id, { streamed: prev + (msg.delta ?? ''), isStreaming: true });
            break;
          }
          case 'node:add':
            s.addNode(msg.node);
            break;
          case 'node:patch':
            s.patchNodeData(msg.id, msg.data);
            break;
          case 'edge:add':
            useStudioStore.setState((prev) => ({ edges: [...prev.edges, msg.edge] }));
            break;
          case 'scene:upsert':
            s.upsertSceneObject(msg.object);
            break;
          case 'scene:clear':
            s.clearScene();
            break;
          case 'done':
            s.patchNodeData(msg.id, { isStreaming: false });
            break;
          case 'error':
            s.patchNodeData(msg.id ?? '', { isStreaming: false, error: msg.message });
            break;
          default:
            break;
        }
      },
    });

    client.connect();
    clientRef.current = client;
    return () => client.close();
  }, [enabled, path]);

  const send = useCallback((payload) => clientRef.current?.send(payload), []);
  return { send };
}