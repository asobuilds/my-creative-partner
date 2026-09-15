# Synthetix - Spatial Studio OS

A real-time 3D creative partner. Voice or type a prompt; nodes grow in a graph, the scene assembles, and an AI companion asks a question about what you made.

## Features
- Prompt to live 3D via procedural geometry (Three.js)
- Voice transcription you can edit before sending
- Multi-provider LLM chain (Groq -> OpenRouter -> Gemini)
- ElevenLabs voice companion
- Shotstack 24h video export
- Responsive: desktop 3-pane / tablet split / mobile gesture

## Stack
- Frontend: React 18, Vite, @xyflow/react, @react-three/fiber, Zustand
- Backend: Express, ws, NodePipelineRouter

## Quick start
1. cp server/.env.example server/.env and fill keys
2. cd server && npm install && npm run dev
3. echo VITE_API_BASE=http://localhost:5000 > .env.local
4. npm install && npm run dev
5. Open in Chrome

## Security
- .env is git-ignored.
- Rotate any exposed key immediately.
