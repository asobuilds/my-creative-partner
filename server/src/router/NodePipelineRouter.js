import { streamChat, completeJSON, llmReady } from '../adapters/llm.js';
import { streamReflection } from '../companion/philosophy.js';
import { buildScene, blenderReady } from '../adapters/blender.js';
import { generateTripoMesh, tripoReady } from '../adapters/tripo.js';

const STATE = { IDLE: 'IDLE', PLANNING: 'PLANNING', STREAMING: 'STREAMING', RENDERING: 'RENDERING', REFLECTING: 'REFLECTING', DONE: 'DONE', ERROR: 'ERROR' };

const PLANNER_SYSTEM = `You are a 3D scene composer. You build stylized scenes from simple primitive shapes (like a low-poly artist). Given a user prompt, output a scene spec.

Return STRICT JSON: { "nodes": [...], "edges": [...], "scene": { "objects": [...] } }

## Scene composition rules
- Use 2 to 6 primitive objects to compose the scene. More objects = more detail.
- Break complex subjects into primitives. "A dragon" = body (torusKnot) + head (sphere) + tail (cone) + eyes (small spheres) + horns (cones).
- "A castle" = towers (cylinders) + roofs (cones) + main hall (box) + flag (thin box).
- "A face" = head (sphere) + eyes (spheres) + nose (cone) + mouth (torus).
- Compose with care: position objects in 3D space so they visually assemble into the subject.
- Vary scale (0.1 to 3.0) per part. Vary color per part.

## Available primitive kinds
box, sphere, torus, cylinder, cone, octahedron, dodecahedron, torusKnot

## Object schema
{
  "id": string (short, unique),
  "kind": one of the primitives above,
  "position": [x, y, z] (Y is up; ground is y=0; scene centered at origin),
  "color": "#rrggbb",
  "emissive": 0.0 to 1.2 (0 = matte, high = glowing),
  "roughness": 0.05 (mirror) to 1.0 (chalky),
  "metalness": 0.0 (organic) to 1.0 (chrome),
  "scale": 0.1 to 3.0
}

## Node graph rules (for the UI)
- 3 to 4 nodes: prompt, model, output, optional mood.
- prompt: { id, type:"prompt", position:{x:0,y:140}, data:{ prompt } }
- model:  { id, type:"model",  position:{x:340,y:140}, data:{ kind:"scene", color, emissive, roughness, metalness, scale } }
- output: { id, type:"output", position:{x:680,y:140}, data:{} }
- mood:   { id, type:"mood",   position:{x:340,y:320}, data:{ color, tone:"calm"|"playful"|"curious"|"wonder" } }
- edges: prompt -> model -> output, and mood -> model.

## Example for "a golden dragon"
{
  "nodes": [
    { "id": "p1", "type": "prompt", "position": {"x":0,"y":140}, "data": {"prompt": "a golden dragon"} },
    { "id": "m1", "type": "model", "position": {"x":340,"y":140}, "data": {"kind":"scene","color":"#ffb700","emissive":0.3,"roughness":0.2,"metalness":0.9,"scale":1} },
    { "id": "o1", "type": "output", "position": {"x":680,"y":140}, "data": {} }
  ],
  "edges": [{"id":"e1","source":"p1","target":"m1"},{"id":"e2","source":"m1","target":"o1"}],
  "scene": {
    "objects": [
      { "id": "body", "kind": "torusKnot", "position": [0, 0.8, 0], "color": "#ffb700", "emissive": 0.3, "roughness": 0.2, "metalness": 0.9, "scale": 1.2 },
      { "id": "head", "kind": "sphere", "position": [0, 1.5, 0.9], "color": "#ffcc00", "emissive": 0.4, "roughness": 0.25, "metalness": 0.85, "scale": 0.55 },
      { "id": "tail", "kind": "cone", "position": [0, 0.6, -1.3], "color": "#ff9900", "emissive": 0.2, "roughness": 0.3, "metalness": 0.8, "scale": 0.8 },
      { "id": "eyeL", "kind": "sphere", "position": [-0.18, 1.6, 1.3], "color": "#ff0044", "emissive": 1.2, "roughness": 0.1, "metalness": 0.2, "scale": 0.09 },
      { "id": "eyeR", "kind": "sphere", "position": [0.18, 1.6, 1.3], "color": "#ff0044", "emissive": 1.2, "roughness": 0.1, "metalness": 0.2, "scale": 0.09 },
      { "id": "hornL", "kind": "cone", "position": [-0.25, 1.9, 0.9], "color": "#fff4c2", "emissive": 0.5, "roughness": 0.15, "metalness": 0.6, "scale": 0.25 },
      { "id": "hornR", "kind": "cone", "position": [0.25, 1.9, 0.9], "color": "#fff4c2", "emissive": 0.5, "roughness": 0.15, "metalness": 0.6, "scale": 0.25 }
    ]
  }
}

Output ONLY the JSON. No markdown, no preamble.`;

function isPrimitivePrompt(p) {
  return /^\s*(a|an|the)?\s*(sphere|ball|orb|torus|ring|donut|doughnut|cube|box|block|cylinder|tube|cone|pyramid|octahedron|dodecahedron|torusknot|knot)\s*$/i.test(String(p || '').trim());
}

export class NodePipelineRouter {
  constructor(send) { this.send = send; this.state = STATE.IDLE; this.abort = null; this.runId = null; }
  cancel() { if (this.abort) try { this.abort.abort(); } catch(e){} this.abort = null; this.state = STATE.IDLE; }
  _emit(o) { try { this.send({ ...o, runId: this.runId }); } catch (e) {} }

  async handleRun({ prompt, graph }) {
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
            [{ role: 'system', content: PLANNER_SYSTEM }, { role: 'user', content: String(prompt).slice(0, 500) }],
            { maxTokens: 1400, temperature: 0.5 }
          );
        } catch (e) {
          this._emit({ type: 'error', message: 'Planner failed: ' + e.message });
        }
      }

      if (plan && plan.nodes) {
        for (const n of plan.nodes) this._emit({ type: 'node:add', node: n });
        for (const e of (plan.edges || [])) this._emit({ type: 'edge:add', edge: { ...e, type: 'stream', animated: true } });
      }

      /* 2. STREAMING REFINEMENT (poetic description for companion context) */
      this.state = STATE.STREAMING;
      this._emit({ type: 'phase', phase: 'streaming' });
      const promptNode = plan && plan.nodes && plan.nodes.find(n => n.type === 'prompt');
      const promptNodeId = (promptNode && promptNode.id) || 'prompt-' + Date.now();
      const refined = await this._streamTokens(promptNodeId, prompt, signal);

      /* 3. SCENE SPEC -> BLENDER */
      const sceneSpec = (plan && plan.scene) || {
        objects: [
          { id: 'core', kind: 'sphere', position: [0, 1, 0], color: '#00f0ff', emissive: 0.5, roughness: 0.3, metalness: 0.5, scale: 1 },
        ],
      };
      const objects = (sceneSpec.objects || []).slice(0, 8).map((o, i) => {
        const safe = o && typeof o === 'object' ? o : {};
        return {
          id: String(safe.id || ('obj' + i)),
          kind: ['box','sphere','torus','cylinder','cone','octahedron','dodecahedron','torusKnot'].includes(safe.kind) ? safe.kind : 'sphere',
          position: Array.isArray(safe.position) && safe.position.length === 3 ? safe.position : [0, 1, 0],
          color: typeof safe.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(safe.color) ? safe.color : '#00f0ff',
          emissive: typeof safe.emissive === 'number' ? Math.max(0, Math.min(1.5, safe.emissive)) : 0.3,
          roughness: typeof safe.roughness === 'number' ? Math.max(0.05, Math.min(1, safe.roughness)) : 0.35,
          metalness: typeof safe.metalness === 'number' ? Math.max(0, Math.min(1, safe.metalness)) : 0.4,
          scale: typeof safe.scale === 'number' ? Math.max(0.05, Math.min(4, safe.scale)) : 1,
        };
      });

      objects.forEach((o) => {
        this._emit({
          type: 'scene:upsert',
          object: {
            id: o.id, kind: o.kind, color: o.color, emissive: o.emissive,
            roughness: o.roughness, metalness: o.metalness,
            position: o.position, growth: 0.01, spin: 0, isGenerating: true,
          },
        });
      });

      /* 4. BLENDER RENDER */
      let preview = null, glb = null, source = null;

      // Path A: Tripo3D (real textured mesh)
      if (tripoReady && !signal.aborted) {
        this.state = STATE.RENDERING;
        this._emit({ type: 'phase', phase: 'rendering' });
        try {
          const richPrompt = objects.map(o => o.kind + ' in ' + o.color).join(', ') + '. ' + (refined || prompt);
          const tripo = await generateTripoMesh(richPrompt, { faceLimit: 50000 });
          glb = tripo.modelUrl;
          preview = tripo.renderedImageUrl;
          source = 'tripo';
          console.log('[tripo] success ->', glb);
        } catch (e) {
          console.warn('[tripo] failed, falling back to Blender:', e.message);
        }
      }

      // Path B: Blender fallback (fast, offline, primitives)
      if (!glb && blenderReady && !signal.aborted) {
        this.state = STATE.RENDERING;
        this._emit({ type: 'phase', phase: 'rendering' });
        try {
          console.log('[blender] building', objects.length, 'objects...');
          const render = await buildScene({ objects }, this.runId);
          preview = render.preview;
          glb = render.glb;
          source = 'blender';
          console.log('[blender] done ->', preview);
        } catch (e) {
          this._emit({ type: 'error', message: 'Blender failed: ' + e.message });
        }
      }

      if (preview || glb) {
        this._emit({ type: 'render:done', preview, glb, source, texture: null });
      }

      objects.forEach(o => this._emit({ type: 'scene:upsert', object: { id: o.id, growth: 1, isGenerating: false, modelUrl: o.modelUrl || null } }));
      this._emit({ type: 'node:patch', id: promptNodeId, data: { isStreaming: false } });
      this._emit({ type: 'done', id: promptNodeId });

      /* 5. COMPANION */
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
      { role: 'system', content: 'You are a scene describer. Given a raw creative prompt, output a short poetic description (max 30 words) of what someone just imagined. Focus on mood and one childlike detail. No preamble. No quotes.' },
      { role: 'user', content: String(prompt).slice(0, 300) },
    ];
    let full = '';
    try {
      for await (const delta of streamChat(messages, { maxTokens: 90, temperature: 0.85 })) {
        if (signal.aborted) break;
        full += delta;
        this._emit({ type: 'token', id: nodeId, delta });
      }
    } catch (e) {}
    return full.trim() || prompt;
  }
}
