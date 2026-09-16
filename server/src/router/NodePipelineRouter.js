import { streamChat, completeJSON, llmReady } from '../adapters/llm.js';
import { generateMesh, normalizeShape } from '../adapters/mesh.js';
import { streamReflection } from '../companion/philosophy.js';
import { buildScene, blenderReady } from '../adapters/blender.js';

const STATE = { IDLE:'IDLE', PLANNING:'PLANNING', STREAMING:'STREAMING', BUILDING:'BUILDING', RENDERING:'RENDERING', REFLECTING:'REFLECTING', DONE:'DONE', ERROR:'ERROR' };

const PRIMITIVE_WORDS = /\b(sphere|ball|orb|torus|ring|donut|cube|box|block|cube|cylinder|tube|cone|pyramid|octahedron|dodecahedron|torusknot|knot)\b/i;
const CONCRETE_WORDS = /\b(chest|dragon|tree|house|castle|car|vehicle|robot|animal|dog|cat|bird|fish|flower|guitar|sword|shield|book|chair|table|lamp|bottle|cup|mug|treasure|human|person|face|head|hand|foot|eye|statue|monument|building|tower|bridge|door|window|wall|stair|garden|forest|mountain|island|boat|ship|plane|rocket|spaceship|helmet|armor|weapon|tool|crown|gem|jewel|coin|vase|pot|plant|leaf|mushroom|crystal|skull|heart|star|moon|planet)\b/i;

function shouldUseMesh(prompt, plannedKind) {
  const p = String(prompt || '');
  const isPrimitive = PRIMITIVE_WORDS.test(p) && !CONCRETE_WORDS.test(p);
  const isConcrete = CONCRETE_WORDS.test(p);
  if (isConcrete) return true;
  if (plannedKind === 'mesh') return true;
  if (isPrimitive) return false;
  // Default to mesh for anything non-obvious
  return true;
}


const PLANNER_SYSTEM = `You convert creative prompts into a compact node-graph plan. You may be given an EXISTING SCENE to extend. If so, decide: ADD new objects (keep existing ones) or REPLACE. Prefer ADD unless the user explicitly says 'instead' or 'replace'.

Return STRICT JSON: { "nodes": [...], "edges": [...], "scene": { "objects": [...] } }

Rules:
- 2 to 4 nodes max.
- Node types: "prompt", "model", "mood", "output".
- Prompt node data: { "prompt": string }
- Model node data: { "kind": string, "color": "#rrggbb", "emissive": 0.4, "roughness": 0.28, "metalness": 0.65, "scale": 1.0 }
- Mood node data: { "color": "#rrggbb", "tone": "calm"|"playful"|"curious"|"wonder" }
- Scene objects: max 3. Each has id, kind, position [x,y,z], color, emissive, roughness, metalness, scale.

DECISION RULE FOR "kind":
- If the prompt names a CONCRETE, ORGANIC or COMPLEX object (a chest, a dragon, a tree, a house, a car, a robot, an animal, a building), set kind = "mesh". The backend will generate a real 3D model.
- If the prompt is an ABSTRACT or SIMPLE shape (a sphere, a torus, a cube, "a floating ball of light"), pick the closest primitive: "box", "sphere", "torus", "cylinder", "cone", "octahedron", "dodecahedron", "torusKnot".
- When in doubt, prefer "mesh".

Edges: prompt -> model -> output.
Layout: prompt x=0 y=140, model x=340 y=140, output x=680 y=140, mood x=340 y=320.`;

export class NodePipelineRouter {
  constructor(send) { this.send = send; this.state = STATE.IDLE; this.abort = null; this.runId = null; }
  cancel() { if (this.abort) try { this.abort.abort(); } catch(e){} this.abort = null; this.state = STATE.IDLE; }
  _emit(o) { try { this.send({ ...o, runId: this.runId }); } catch (e) {} }

  async handleRun({ prompt, graph, existingScene }) {
    if (this.state !== STATE.IDLE) this.cancel();
    this.abort = new AbortController();
    this.runId = 'run-' + Date.now();
    const signal = this.abort.signal;

    try {
      /* 1. PLANNING */
      this.state = STATE.PLANNING;
      this._emit({ type: 'phase', phase: 'planning' });

      let plan = null;
      if (llmReady) {
        try {
          plan = await completeJSON(
            [{ role: 'system', content: PLANNER_SYSTEM }, { role: 'user', content: (graph && graph.existingScene && graph.existingScene.length ? 'EXISTING SCENE: ' + JSON.stringify(graph.existingScene.map(o => ({id: o.id, kind: o.kind, modelUrl: o.modelUrl ? 'yes' : 'no'}))) + '\n\nUSER: ' + String(prompt).slice(0, 500) : String(prompt).slice(0, 500)) }],
            { maxTokens: 900, temperature: 0.25 }
          );
        } catch (e) {
          this._emit({ type: 'error', message: 'LLM planning failed: ' + e.message });
        }
      }
      if (signal.aborted) return;

      if (plan && plan.nodes) {
        for (const n of plan.nodes) this._emit({ type: 'node:add', node: n });
        for (const e of (plan.edges || [])) this._emit({ type: 'edge:add', edge: { ...e, type: 'stream', animated: true } });
      }

      /* 2. STREAMING */
      this.state = STATE.STREAMING;
      this._emit({ type: 'phase', phase: 'streaming' });
      const promptNode = plan && plan.nodes && plan.nodes.find(n => n.type === 'prompt');
      const promptNodeId = (promptNode && promptNode.id) || 'prompt-' + Date.now();
      const refined = await this._streamTokens(promptNodeId, prompt, signal);
      if (signal.aborted) return;

      /* 3. SCENE SPEC */
      const sceneSpec = (plan && plan.scene) || { objects: [{ id: 'main', kind: 'mesh', position: [0, 0.8, 0], color: '#00f0ff', emissive: 0.5, scale: 1 }] };
      const objects = (sceneSpec.objects || []).slice(0, 3).map((o, i) => ({
        ...normalizeShape(o),
        id: o.id || ('obj-' + i + '-' + Math.random().toString(36).slice(2, 6)),
      }));

      // Emit placeholders immediately so the user sees *something*
      objects.forEach((o) => {
        this._emit({
          type: 'scene:upsert',
          object: {
            id: o.id, kind: o.kind, color: o.color, emissive: o.emissive,
            position: o.position, growth: 0.01, spin: 0.35, isGenerating: true,
          },
        });
      });

      console.log('[DEBUG] prompt=', JSON.stringify(prompt));
      console.log('[DEBUG] objects=', JSON.stringify(objects.map(o=>({id:o.id,kind:o.kind}))));
      const forceMesh = shouldUseMesh(prompt, objects[0] && objects[0].kind);
      console.log('[DEBUG] forceMesh=', forceMesh);
      const hasMeshKind = forceMesh || objects.some(o => o.kind === 'mesh');
      if (forceMesh) objects.forEach(o => { o.kind = 'mesh'; });
      let finalGlb = null;
      let finalPreview = null;

      /* 4a. HIGH-QUALITY MESH PATH */
      if (hasMeshKind) {
        this.state = STATE.BUILDING;
        this._emit({ type: 'phase', phase: 'building' });
        try {
          console.log('[DEBUG] calling three.ws generateMesh...');
          finalGlb = await generateMesh(prompt);
          console.log('[DEBUG] three.ws returned=', finalGlb);
          if (finalGlb) { objects.forEach(o => { if (o.kind === 'mesh') o.modelUrl = finalGlb; }); }
        } catch (e) {
          this._emit({ type: 'error', message: 'Mesh generation failed: ' + e.message });
        }
      }

      /* 4b. BLENDER FALLBACK (only if no mesh result) */
      console.log('[DEBUG] Blender fallback reached. finalGlb=', finalGlb);
      if (!finalGlb && blenderReady && !signal.aborted) {
        this.state = STATE.RENDERING;
        this._emit({ type: 'phase', phase: 'rendering' });
        try {
          const procedural = objects.filter(o => o.kind !== 'mesh').map((o, i) => ({
            id: o.id, kind: o.kind, position: o.position, color: o.color,
            emissive: o.emissive, roughness: o.roughness, metalness: o.metalness, scale: o.scale,
          }));
          const spec = { objects: procedural.length ? procedural : [{ id: 'main', kind: 'sphere', position: [0, 1, 0], color: objects[0]?.color || '#00f0ff', emissive: 0.4, roughness: 0.3, metalness: 0.4, scale: 1 }] };
          const render = await buildScene(spec, this.runId);
          if (signal.aborted) return;
          finalPreview = render.preview;
          if (!finalGlb) finalGlb = render.glb;
          if (render.glb) { objects.forEach(o => { o.modelUrl = render.glb; }); }
        } catch (e) {
          this._emit({ type: 'error', message: 'Blender render failed: ' + e.message });
        }
      }

      /* 5. EMIT RENDER RESULT */
      if (finalPreview || finalGlb) {
        this._emit({ type: 'render:done', preview: finalPreview, glb: finalGlb, texture: null });
      }

      objects.forEach(o => this._emit({ type: 'scene:upsert', object: { id: o.id, kind: o.kind, modelUrl: o.modelUrl || null, growth: 1, isGenerating: false } }));
      this._emit({ type: 'node:patch', id: promptNodeId, data: { isStreaming: false } });
      this._emit({ type: 'done', id: promptNodeId });

      /* 6. COMPANION */
      this.state = STATE.REFLECTING;
      const reflectionId = 'reflect-' + Date.now();
      this._emit({ type: 'companion:start', id: reflectionId });
      let text = '';
      try {
        for await (const delta of streamReflection(refined || prompt, signal)) {
          if (signal.aborted) return;
          text += delta;
          this._emit({ type: 'companion:token', id: reflectionId, delta });
        }
      } catch (e) {}
      this._emit({ type: 'companion:done', id: reflectionId, text });

      this.state = STATE.DONE;
      this._emit({ type: 'phase', phase: 'done' });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      this.state = STATE.ERROR;
      this._emit({ type: 'error', message: String((err && err.message) || err) });
    } finally {
      this.state = STATE.IDLE;
      try { this._emit({ type: 'phase', phase: 'done' }); } catch (e) {}
    }
  }

  async _streamTokens(nodeId, prompt, signal) {
    if (!llmReady) return prompt;
    const messages = [
      { role: 'system', content: 'You are a 3D concept refiner. Given a raw creative prompt, output a single concise visual description (max 40 words) describing shape, palette, mood, and one childlike detail. No preamble. No quotes.' },
      { role: 'user', content: String(prompt).slice(0, 300) },
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
