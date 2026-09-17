# 9jaWonderPal — Imagination Studio for Kids & Parents

> **"Say it. See it. Wonder about it."**

A voice-first creative studio where a child speaks an idea and watches it become a 3D world. Built for parents who want an alternative to passive screen time.

---

## What it is

9jaWonderPal is not another story app, video app, or game. It is a **co-creation space** — a parent and child sit together, the child speaks, and a small 3D world builds in front of them. After each world, a gentle companion asks a question. Not a lecture. An invitation.

**The core promise to parents:** *"This is not an app that watches your child. This is an app that listens to them."*

---

## Why it exists

**The problem:** Kids' screen time is dominated by passive consumption. Existing creative apps require reading and typing — barriers for children aged 4 to 10. Most "AI for kids" tools generate flat images that get lost in a camera roll.

**The solution:** A voice-first studio that turns imagination into walkable 3D worlds, keeps every creation, and opens a conversation between child and parent.

**The differentiator:** No other tool combines *voice input* + *real 3D* + *philosophical reflection* + *parent-facing artifacts*.

---

## Features

### For the child
- **Big mic button.** Tap and speak. No reading, no typing, no menus.
- **3D worlds, not pictures.** Watch the world orbit as it is built.
- **Companion friend.** A soft voice asks one curious question after each creation.
- **Warm, calm palette.** Mood-adaptive — playful during the day, gentle at night.
- **Build on it.** "Add a tower", "make it night" — the world rebuilds around what came before.
- **My Worlds.** Every creation saved as a rendered image with its prompt history.

### For the parent
- **Onboarding.** Four gentle screens explaining the philosophy, safety, and how to co-create.
- **Parent Mode toggle.** Reveals the technical view: node graph, scene state, live logs.
- **Session export.** Every world is saved locally with a preview image.
- **No account required** to try. Optional sign-in for syncing.

### For the technical user (Parent Mode)
- Full **React Flow** node graph editor
- Live WebSocket streaming from the backend
- Blender headless renders with real lighting and materials
- Multi-provider LLM failover (Groq to OpenRouter)
- ElevenLabs voice, optional

---

## Architecture
FRONTEND (React + Vite)
ChildMode.jsx voice-first UI
StudioWorkspace.jsx parent technical view
SpatialViewport.jsx Three.js canvas
CompanionOverlay.jsx reflection bubble
WorldsDrawer local storage gallery

WebSocket

BACKEND (Node.js + Express + ws)
NodePipelineRouter
LLM planner Groq / OpenRouter
Scene composer primitives plus positions
Blender subprocess build_scene.py
Companion child-tuned reflection

Adapters: llm, blender, tts, image, video, media

text

---

## Getting started

### 1. Clone
git clone https://github.com/asobuilds/my-creative-partner.git
cd my-creative-partner

text

### 2. Backend
cd server
npm install
cp .env.example .env
nano .env
npm run dev

text

Fill in `GROQ_API_KEY` at minimum. Backend runs on `http://localhost:5000`.

### 3. Blender (for 3D rendering)
mkdir -p ~/.local/opt ~/.local/bin
cd ~/.local/opt
wget https://download.blender.org/release/Blender4.2/blender-4.2.3-linux-x64.tar.xz
tar -xf blender-4.2.3-linux-x64.tar.xz
mv blender-4.2.3-linux-x64 blender
ln -sf ~/.local/opt/blender/blender ~/.local/bin/blender
echo 'export PATH="
H
O
M
E
/
.
l
o
c
a
l
/
b
i
n
:
HOME/.local/bin:PATH"' >> ~/.zshrc
source ~/.zshrc
blender --version

text

Should print `Blender 4.2.x`.

### 4. Frontend
cd ..
npm install
npm run dev

text

Open `http://localhost:5173` in **Chrome** (voice requires Chromium).

---

## Environment variables

### Backend (`server/.env`)

| Key | Required | Purpose |
|---|---|---|
| `PORT` | yes | Backend port (default 5000) |
| `CLIENT_ORIGIN` | yes | CORS origin (default `http://localhost:5173`) |
| `GROQ_API_KEY` | required | Primary LLM for planning plus companion |
| `OPENROUTER_API_KEY` | fallback | Used if Groq fails |
| `ELEVENLABS_API_KEY` | optional | Companion voice (TTS) |
| `HF_API_KEY_ID` | optional | Higgsfield image generation |
| `HF_API_KEY_SECRET` | optional | Higgsfield image generation |
| `BLENDER_PATH` | optional | Override Blender binary path |

### Frontend (`.env.local`)

| Key | Purpose |
|---|---|
| `VITE_API_BASE` | Backend URL (default `http://localhost:5000`) |
| `VITE_VOICE_AUTOSUBMIT` | `true` submits voice immediately |
| `VITE_VOICE_LANG` | Speech recognition language |
| `VITE_COMPANION_ENABLED` | Toggle companion voice |

---

## Project structure
creative-partner-app/
src/
components/
studio/
ChildMode.jsx
StudioWorkspace.jsx
SpatialViewport.jsx
CompanionOverlay.jsx
HUD.jsx
Onboarding.jsx
LandingPage.jsx
Sidebar.jsx
Modals.jsx
engine/
voiceEngine.js
promptEngine.js
moodEngine.js
hooks/
useVoicePrompt.js
useStreamingClient.js
usePromptEngine.js
useResponsive.js
store/studioStore.js
App.jsx
server/
src/
adapters/
llm.js
blender.js
tts.js
image.js
video.js
media.js
companion/philosophy.js
router/NodePipelineRouter.js
index.js
scripts/build_scene.py
.env.example
README.md
AGENT.md

text

---

## The child-mode flow

1. Child opens the app. No account required.
2. First time: 4-screen onboarding for the parent.
3. Land on **Create** — a big mic, a warm palette, an empty world.
4. Child taps mic and speaks. Transcript appears and auto-submits after 0.8 seconds.
5. Backend: LLM plans scene, Blender builds it, render streams back.
6. Companion bubble appears with a gentle question.
7. Child speaks more ("add a tree"). World rebuilds around previous.
8. Parent taps Save. World stored with preview image.
9. Optional: toggle **Parent Mode** to see the full node graph.

---

## Technical notes

- **No paid AI services required.** Groq's free tier is enough for planning plus companion. Blender runs locally. Everything else degrades gracefully.
- **Blender renders in 5 to 15 seconds** on a mid-range laptop. Sample count is configurable in `server/scripts/build_scene.py`.
- **Free-tier design.** No tracking. No ads. No accounts. Local storage only.
- **Voice-first for a reason.** Children aged 4 to 10 cannot reliably type. Voice removes the barrier.
- **Companion is the differentiator.** The reflection question is what turns the tool into a conversation between parent and child.

---

## Roadmap

- **Phase 1 (done).** Voice input, 3D scene composition, Blender rendering, companion reflection, worlds gallery, onboarding, parent mode.
- **Phase 2 (next).** Auto-video export via Shotstack, bedtime mode, sibling mode, session sharing.
- **Phase 3.** Curated prompt library, parent community, weekly imagination prompts.

---

## License

Private. All rights reserved.
