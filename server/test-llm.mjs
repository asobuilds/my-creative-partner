import { completeJSON, llmReady, providerStatus } from './src/adapters/llm.js';

console.log('llmReady:', llmReady, 'providers:', providerStatus);

const SYS = `You convert creative prompts into a small node-graph plan.

Return STRICT JSON: { "nodes": [...], "edges": [...], "scene": { "objects": [...] } }

Rules:
- 2 to 4 nodes max.
- Allowed node types: "prompt", "model", "mood", "output".
- Prompt node data: { "prompt": string }
- Model node data:  { "kind": "box"|"sphere"|"torus"|"cylinder"|"cone"|"octahedron"|"dodecahedron"|"torusKnot", "color": "#rrggbb", "emissive": 0.4, "roughness": 0.28, "metalness": 0.65, "scale": 1.0 }
- Mood node data:   { "color": "#rrggbb", "tone": "calm"|"playful"|"curious"|"wonder" }
- Output node data: { }
- Edges: prompt -> model -> output.
- Scene objects: 1 to 4 objects with id, kind, position [x,y,z], color, emissive, roughness, metalness, scale.

EXAMPLE OUTPUT:
{"nodes":[{"id":"p1","type":"prompt","position":{"x":0,"y":140},"data":{"prompt":"golden sphere"}},{"id":"m1","type":"model","position":{"x":340,"y":140},"data":{"kind":"sphere","color":"#ffaa00","emissive":0.6,"roughness":0.2,"metalness":0.9,"scale":1}}],"edges":[{"id":"e1","source":"p1","target":"m1"}],"scene":{"objects":[{"id":"m1","kind":"sphere","position":[0,1,0],"color":"#ffaa00","emissive":0.6,"roughness":0.2,"metalness":0.9,"scale":1}]}}`;

const test = async (prompt) => {
  console.log('\n=== PROMPT:', prompt, '===');
  const t0 = Date.now();
  try {
    const plan = await completeJSON(
      [{ role: 'system', content: SYS }, { role: 'user', content: prompt }],
      { maxTokens: 900, temperature: 0.25 }
    );
    console.log('elapsed:', Date.now() - t0, 'ms');
    if (!plan) {
      console.log('FAIL: completeJSON returned null');
      return;
    }
    console.log('plan keys:', Object.keys(plan));
    console.log('nodes:', plan.nodes ? plan.nodes.length : 0);
    console.log('edges:', plan.edges ? plan.edges.length : 0);
    console.log('scene:', JSON.stringify(plan.scene, null, 2));
  } catch (e) {
    console.log('THREW:', e.message);
  }
};

await test('a floating golden sphere with chrome reflections');
await test('a blue torus that spins');
await test('add a human eye to the sphere');
process.exit(0);
