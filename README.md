# Synthetix — Spatial Studio OS

A real-time 3D creative partner: childlike on the surface, deep underneath.
Voice or type a prompt; the graph grows, the scene materializes, and a philosophical AI companion asks you a question about what you just made.

## What it does

- **Prompt to 3D, live.** Type or speak. Watch nodes appear in a React Flow graph while a procedural mesh assembles in a Three.js viewport.
- **Voice you can edit.** Speech is transcribed into the prompt bar in real time. It does not auto-submit — you edit and press Enter when ready.
- **Philosophical companion.** After each generation, a streamed reflection question appears, grounded in what you created.
- **Multi-provider LLM chain.** Groq to OpenRouter to Gemini with automatic failover.
- **ElevenLabs voice.** The companion speaks its reflection aloud.
- **Story export.** One-click 24-hour vertical video via Shotstack.
- **Responsive workspace.** Desktop 3-pane, tablet split, mobile gesture-first.

## Stack

### Frontend
- React 18 + Vite
- @xyflow/react — node graph editor
- @react-three/fiber + @react-three/drei + three — 3D viewport
- Zustand — single store for graph, scene, companion, mood
- Web Speech API — voice engine (Chrome only)

### Backend
- Express + ws (WebSocket + SSE fallback)
- NodePipelineRouter — state machine per generation
- Adapters: llm, mesh, tts, media, video

## Getting started

### 1. Clone

git clone https://github.com/asobuilds/my-creative-partner.git
cd my-creative-partner

### 2. Backend env

cp server/.env.example server/.env
nano server/.env

Fill in: GROQ_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY, SHOTSTACK_API_KEY.

### 3. Backend run

cd server
npm install
npm run dev

Expected: Synthetix orchestrator on :5000 [llm=true ...]

### 4. Frontend env

Create .env.local at repo root with:

VITE_API_BASE=http://localhost:5000
VITE_STREAM_PATH=/api/stream
VITE_VOICE_AUTOSUBMIT=false
VITE_VOICE_LANG=en-US
VITE_VOICE_INTERIM=true
VITE_COMPANION_ENABLED=true

### 5. Frontend run

npm install
npm run dev

Open the URL in Chrome (voice needs WebkitSpeechRecognition).

## Project structure

src/ — frontend (components, hooks, engine, services, store)
server/ — backend (adapters, router, companion)

## Security

- .env is git-ignored. Never commit real keys.
- Rotate any key that has been exposed immediately.
- GitHub push protection blocks commits containing live secrets.

## License

Private. All rights reserved.
