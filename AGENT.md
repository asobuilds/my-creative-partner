# AGENT.md — Context for AI coding assistants

This file is the single source of truth for any AI agent (Claude, GPT, Copilot, Cursor) working on **WonderPal**. Read this before touching any code.

---

## What this project is

**WonderPal** is a voice-first creative studio for children aged 4 to 10 and their parents. A child speaks an idea; the system builds a 3D world; a companion asks a reflection question.

Not a game. Not a story app. Not a chatbot.

**Formerly:** Synthetix Spatial Studio OS (adult technical tool). Renamed during a strategic pivot to the kids' market.

---

## The two modes

The app has **two fully separate UI modes**:

| Mode | Component | Audience | Design language |
|---|---|---|---|
| Child Mode | `src/components/studio/ChildMode.jsx` | Kids 4 to 10 plus parent sitting together | Big mic, warm palette, no technical chrome, one input |
| Parent Mode | `src/components/studio/StudioWorkspace.jsx` | Technical parent, developer, curious user | Node graph, live logs, full scene inspector |

Toggle: bottom-right button in the canvas tab.

**Rule:** Never add technical UI (node graphs, JSON inspectors, sample-count sliders) to Child Mode. Ever.

---

## The invariants

These must never break:

1. **Voice is the primary input.** Child Mode auto-submits after voice recognition. No keyboard required.
2. **Blender is the render engine.** No external paid 3D APIs. Everything happens locally via `server/scripts/build_scene.py`.
3. **Companion tone is child-first.** Never "great job!", "let's learn about...", "that's amazing!". Only curious questions. See `server/src/companion/philosophy.js`.
4. **No accounts required.** LocalStorage only. Optional sign-in for future sync.
5. **Renders are compositional.** The LLM composes 2 to 8 primitive objects into a stylized scene. No single-mesh generation.
6. **Scene history is preserved.** Each prompt adds to `sceneHistory`. Blender rebuilds the whole scene each time.

---

## Architecture at a glance
Frontend (Vite plus React)
ChildMode.jsx voice-first UI
StudioWorkspace.jsx technical UI
SpatialViewport.jsx Three.js canvas (shared)
CompanionOverlay.jsx reflection bubble (shared)

Backend (Node.js plus Express plus ws)
NodePipelineRouter.js orchestration state machine
adapters/llm.js Groq plus OpenRouter, failover
adapters/blender.js spawns Blender subprocess
companion/philosophy.js child-tuned reflection prompt
scripts/build_scene.py Blender scene builder

Transport: WebSocket primary, SSE plus REST fallback

text

---

## State machine — NodePipelineRouter
IDLE
down (graph:run received)
PLANNING LLM composes node graph plus scene spec
STREAMING LLM streams a poetic prompt description
RENDERING Blender subprocess builds plus renders
REFLECTING Companion streams reflection question
DONE

text

Emits frames: `phase`, `node:add`, `edge:add`, `scene:upsert`, `token`, `render:done`, `companion:start`, `companion:token`, `companion:done`, `done`, `error`.

**Never emit a state change without a matching phase frame.** The frontend relies on `phase` to show the current step.

---

## The LLM planner contract

`PLANNER_SYSTEM` in `NodePipelineRouter.js` requires strict JSON:
{
"nodes": [prompt, model, output, optional mood],
"edges": [...],
"scene": {
"objects": [
{
"id": "string",
"kind": "box|sphere|torus|cylinder|cone|octahedron|dodecahedron|torusKnot",
"position": [x, y, z],
"color": "#rrggbb",
"emissive": 0.0 to 1.5,
"roughness": 0.05 to 1.0,
"metalness": 0.0 to 1.0,
"scale": 0.05 to 4.0
}
]
}
}

text

**When editing the system prompt:**
- Keep the "compose from primitives" instruction. This is what produces multi-object scenes.
- Keep the concrete example. The LLM copies the format.
- Do not add "kind: mesh". The mesh path was removed.
- Never instruct the LLM to write prose. Only JSON.

---

## Blender contract — build_scene.py

Called as:
blender --background --python scripts/build_scene.py -- <spec.json> <output_dir>

text

Reads spec from JSON, builds objects, sets up 3-point lighting plus ground plane, auto-frames a camera, renders 1280 by 720 PNG (EEVEE, 24 samples), exports GLB.

Outputs in order in stdout:
- `SPEC: {...}` — the input spec
- `BUILT: <name> <kind> color=... metal=... rough=...` — per object
- JSON result line `{"status":"ok","preview":"...","glb":"...","objects":N}`

The Node adapter finds the JSON line by scanning backwards for a `{...}` on its own line.

**When editing:**
- Do not add Cycles rendering. It is 30x slower and unnecessary for stylized scenes.
- Do not exceed 24 samples. Below 16 becomes grainy.
- Do not skip the `print(json.dumps(...))` at the end. The Node adapter depends on it.
- Keep `shade_smooth()` on curved primitives and `bevel` on boxes.

---

## The companion voice rules

`CHILD_SYSTEM` in `server/src/companion/philosophy.js`:

- Max 14 words
- Simple vocabulary a 6-year-old knows
- Curious, never preachy, never teaches
- No "great job", "amazing", "well done"
- No markdown, no quotes, no preamble
- Must end with a question mark

**When editing:**
- Every example question must be answerable by a child with 1 to 3 sentences.
- Test with prompts like "a dragon", "a house", "my grandmother".
- If the LLM starts producing lectures, tighten the "NEVER say" list.

---

## Frontend patterns

### Store — src/store/studioStore.js

Zustand. Single store. One flat object.

**Do not split the store.** All state lives here so `useStreamingClient` can write to it from outside React.

### Streaming — src/hooks/useStreamingClient.js

Subscribes to the backend. Every server frame is dispatched to the store. Never call `setState` directly from a socket handler. Always go through the store.

### Voice — src/engine/voiceEngine.js

Wraps `webkitSpeechRecognition`. Chrome only. Auto-restarts are **disabled** on purpose. Otherwise the mic keeps hijacking the input.

### Prompt engine — src/engine/promptEngine.js

Single submit path for text plus voice. It does not create nodes client-side. The LLM owns the graph.

### Spatial viewport — src/components/studio/SpatialViewport.jsx

Three.js plus react-three-fiber. When `lastRender.preview` exists, the viewport shows the Blender render fullscreen instead of the live 3D scene. Toggle button switches between them.

---

## Do not

- Do not add paid services without explicit user approval.
- Do not add authentication walls to Child Mode.
- Do not add a sign-up prompt before the first creation.
- Do not add analytics, telemetry, or tracking.
- Do not show the node graph to a child.
- Do not reference "Synthetix" — the project is WonderPal now.
- Do not add "kind: mesh" back to the planner. three.ws was removed because of grey-box output on the free tier.
- Do not use `require()` in server code. The server is ESM (`"type": "module"`).
- Do not use heredocs with `#` at shell level. zsh chokes on `#` in pasted commands.

---

## Do

- Test every prompt against 3 cases: a simple object ("a sphere"), a childlike idea ("a dragon who reads"), and an abstract idea ("a lonely door").
- Check the backend terminal for `[DEBUG]` lines when things break. They are placed at every major step.
- Keep responses under 1000 words when giving the user commands. They paste blocks verbatim.
- Prefer rewriting a whole file over patching with sed or node when the pattern is fragile.
- Use `cat > file << 'EOF' ... EOF` for multi-line writes. Not `node -e` for anything with parentheses or quotes.
- When the user says "let's push", commit and push in the same response.

---

## Environment quick reference

Start backend:
cd server && npm run dev

text

Start frontend:
npm run dev

text

Kill everything:
pkill -f nodemon; pkill -f "node src/index.js"; pkill -f vite; pkill -9 blender

text

Health check:
curl -s http://localhost:5000/health | python3 -m json.tool

text

Blender test:
cd server && blender --background --python scripts/build_scene.py -- /tmp/test-spec.json /tmp/blender-out 2>&1 | tail -3

text

---

## Known limits

- **Stylized, not photoreal.** The Blender pipeline composes primitives. It will never produce a photoreal face. It will produce a beautiful stylized world. That is the design.
- **Chrome for voice.** Web Speech API is Chromium-only.
- **Groq free tier rate-limits.** About 30 requests per minute. When hit, the pipeline falls back to OpenRouter.
- **Blender is slow on integrated GPUs.** 5 to 15 seconds per render. Acceptable for a creative flow, not for real-time.

---

## Where to make changes

| Change | File |
|---|---|
| Kid-facing UI | src/components/studio/ChildMode.jsx |
| Companion questions | server/src/companion/philosophy.js |
| 3D scene layout and look | server/scripts/build_scene.py |
| LLM scene planning | PLANNER_SYSTEM in server/src/router/NodePipelineRouter.js |
| Voice behavior | src/engine/voiceEngine.js |
| Streaming protocol | src/hooks/useStreamingClient.js plus server/src/index.js |
| Color palette and mood | src/engine/moodEngine.js |
| Onboarding copy | src/components/Onboarding.jsx |
| Marketing copy | src/components/LandingPage.jsx |

---

## The one rule

**Everything serves the child-first promise.** If a feature makes the child's experience more magical and does not add friction, it belongs. If it makes the tool more powerful for the parent at the cost of the child's ease, it goes into Parent Mode only.

That is the entire design philosophy.
