import { streamChat, completeJSON, llmReady } from '../adapters/llm.js';
import { generateMesh, meshReady } from '../adapters/mesh.js';
import { streamReflection } from '../companion/philosophy.js';

const STATE = {
  IDLE: 'IDLE', PLANNING: 'PLANNING', STREAMING: 'STREAMING',
  MATERIALIZING: 'MATERIALIZING', REFLECTING: 'REFLECTING', DONE: 'DONE', ERROR: 'ERROR',
};

const PLANNER_SYSTEM = `You convert creative prompts into a small node-graph plan.

Return STRICT JSON: { "nodes": [...], "edges": [...] }

Rules:
- 2 to 4 nodes max.
- Allowed node types: "prompt", "model", "mood", "output".
- Each node has: id (string), type, position {x,y}, data (object).
- Prompt node data: { "prompt": string }
- Model node data:  { "kind": "box"|"sphere"|"torus"|"cloud", "color": "#rrggbb", "emissive": 0.4 }
- Mood node data:   { "color": "#rrggbb", "tone": "calm"|"playful"|"curious"|"wonder" }
- Output node data: { }
- Edges: prompt -> model -> output, and mood -> model (optional).
- Layout: prompt x=0 y=140, model x=340 y=140, output x=680 y=140, mood x=340 y=320.`;

export class NodePipelineRouter {
  constructor(send) {
    this.send = send;
    this.state = STATE.IDLE;
    this.abort = null;
    this.runId = null;
  }

  cancel() {
    if (this.abort) this.abort.abort();
    this.abort = null;
    this.state = STATE.IDLE;
  }

  _emit(obj) { this.send({ ...obj, runId: this.runId }); }

  async handleRun({ prompt, graph }) {
    if (this.state !== STATE.IDLE) this.cancel();
    this.abort = new AbortController();
    this.runId = 'run-' + Date.now();
    const signal = this.abort.signal;

    try {
      this.state = STATE.PLANNING;
      this._emit({ type: 'phase', phase: 'planning' });

      let plan = null;
      if (llmReady) {
        plan = await completeJSON(
          [{ role: 'system', content: PLANNER_SYSTEM }, { role: 'user', content: prompt }],
          { maxTokens: 700, temperature: 0.2, signal }
        );
      }
      if (signal.aborted) return;

      if (plan && plan.nodes && plan.nodes.length) {
        for (const n of plan.nodes) this._emit({ type: 'node:add', node: n });
        for (const e of (plan.edges || [])) {
          this._emit({ type: 'edge:add', edge: { ...e, type: 'stream', animated: true } });
        }
      } else {
        const id = 'prompt-' + Date.now();
        const mid = 'model-' + Date.now();
        this._emit({ type: 'node:add', node: { id, type: 'prompt', position: { x: 0, y: 140 }, data: { prompt } } });
        this._emit({ type: 'node:add', node: { id: mid, type: 'model', position: { x: 340, y: 140 }, data: { kind: 'cloud', color: '#00f0ff', emissive: 0.4 } } });
        this._emit({ type: 'edge:add', edge: { id: id + '->' + mid, source: id, target: mid, type: 'stream', animated: true } });
      }

      this.state = STATE.STREAMING;
      this._emit({ type: 'phase', phase: 'streaming' });
      const promptNode = plan && plan.nodes && plan.nodes.find(n => n.type === 'prompt');
      const promptNodeId = (promptNode && promptNode.id) || 'prompt-' + Date.now();
      const refined = await this._streamTokens(promptNodeId, prompt, signal);
      if (signal.aborted) return;

      this.state = STATE.MATERIALIZING;
      this._emit({ type: 'phase', phase: 'materializing' });

      const modelNodePlan = plan && plan.nodes && plan.nodes.find(n => n.type === 'model');
      const modelNodeId = (modelNodePlan && modelNodePlan.id) || 'model-' + Date.now();
      const kind = (modelNodePlan && modelNodePlan.data && modelNodePlan.data.kind) || 'cloud';
      const color = (modelNodePlan && modelNodePlan.data && modelNodePlan.data.color) || '#00f0ff';

      this._emit({
        type: 'scene:upsert',
        object: {
          id: modelNodeId, kind, color,
          position: [0, 0.8, 0], growth: 0.01, spin: 0.35,
          label: refined.slice(0, 42), isGenerating: true,
        },
      });

      let modelUrl = null;
      if (meshReady) {
        try { modelUrl = await generateMesh(refined); }
        catch (e) { this._emit({ type: 'error', id: modelNodeId, message: String((e && e.message) || e) }); }
      }

      this._emit({
        type: 'scene:upsert',
        object: { id: modelNodeId, modelUrl, growth: 1, isGenerating: false },
      });
      this._emit({ type: 'node:patch', id: modelNodeId, data: { isStreaming: false } });
      this._emit({ type: 'done', id: promptNodeId });

      this.state = STATE.REFLECTING;
      const reflectionId = 'reflect-' + Date.now();
      this._emit({ type: 'companion:start', id: reflectionId });
      let text = '';
      for await (const delta of streamReflection(refined || prompt, signal)) {
        if (signal.aborted) return;
        text += delta;
        this._emit({ type: 'companion:token', id: reflectionId, delta });
      }
      this._emit({ type: 'companion:done', id: reflectionId, text });

      this.state = STATE.DONE;
      this._emit({ type: 'phase', phase: 'done' });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      this.state = STATE.ERROR;
      this._emit({ type: 'error', message: String((err && err.message) || err) });
    } finally {
      this.state = STATE.IDLE;
    }
  }

  async _streamTokens(nodeId, prompt, signal) {
    if (!llmReady) return prompt;
    const messages = [
      {
        role: 'system',
        content: 'You are a 3D concept refiner. Given a raw creative prompt, output a single concise visual description (max 40 words) describing shape, palette, mood, and one childlike detail. No preamble. No quotes.',
      },
      { role: 'user', content: prompt },
    ];
    let full = '';
    try {
      for await (const delta of streamChat(messages, { maxTokens: 120, temperature: 0.8, signal })) {
        if (signal.aborted) break;
        full += delta;
        this._emit({ type: 'token', id: nodeId, delta });
      }
    } catch (e) {}
    return full.trim() || prompt;
  }
}
