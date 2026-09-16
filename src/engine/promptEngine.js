import { useStudioStore } from '../store/studioStore';

export class PromptEngine {
  constructor(send) {
    this.send = send;
    this.lastSubmitted = { text: '', ts: 0 };
  }

  async submit(text, { source = 'text' } = {}) {
    const clean = (text || '').trim();
    if (!clean) return false;

    const now = performance.now();
    if (clean === this.lastSubmitted.text && now - this.lastSubmitted.ts < 1200) return false;
    this.lastSubmitted = { text: clean, ts: now };

    const store = useStudioStore.getState();
    store.addToHistory(clean);
    store.setPromptInput('');
    store.setPhase('planning');

    return this.send({
      type: 'graph:run',
      prompt: clean,
      source,
      graph: { nodes: store.nodes, edges: store.edges },
      existingScene: store.sceneHistory,
    });
  }

  cancel() { this.send({ type: 'graph:cancel' }); }
}
