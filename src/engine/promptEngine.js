import { useStudioStore } from '../store/studioStore';

export class PromptEngine {
  constructor(send) { this.send = send; this.lastSubmitted = { text: '', ts: 0 }; }
  async submit(text, { source = 'text' } = {}) {
    const clean = (text || '').trim();
    if (!clean) return false;
    const now = performance.now();
    if (clean === this.lastSubmitted.text && now - this.lastSubmitted.ts < 1200) return false;
    this.lastSubmitted = { text: clean, ts: now };
    const store = useStudioStore.getState();
    const rootId = 'prompt-' + Date.now();
    store.addNode({ id: rootId, type: 'prompt', position: { x: 40, y: 140 + Math.random() * 60 }, data: { prompt: clean, isStreaming: true, source, streamed: '' } });
    store.setPromptInput('');
    store.setPhase('planning');
    return this.send({ type: 'graph:run', prompt: clean, graph: { nodes: store.nodes, edges: store.edges } });
  }
  cancel() { this.send({ type: 'graph:cancel' }); }
}
