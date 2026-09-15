cat << 'EOF' > AGENT.md
# Research Blueprint & Master Architecture: Voice-Driven 3D Generative Sandbox & Spatial Partner

## 1. Executive Summary, Philosophy & Research Vision

### Bridging the Global AI & Creative Innovation Gap
Current artificial intelligence platforms heavily favor text-driven, Western-centric interfaces, leaving a significant gap in localized, voice-first, and highly visual creative tools built for young learners and innovators across Africa and the global south.

This project is framed as an open research and engineering quest to bridge this gap by designing an accessible, low-latency, voice-driven 3D creation engine. By prioritizing natural spoken commands, voice biometrics, and real-time spatial synthesis, the platform democratizes digital creation—enabling individuals, regardless of technical background or literacy level, to instantly bridge the gap between human imagination and real-world 3D reality.

### Philosophical Pedagogy: "From Thought to Real-World Form"
The system answers a fundamental human question: *What does a person's inner imagination look like when brought into tangible, interactive reality?*

Instead of simply displaying static or pre-rendered 3D models, **Synthetix** operates on the principle of **pedagogical spatial assembly**. Models build step-by-step—progressing from point cloud data to wireframe geometry, volumetric mass, and high-definition 4K textured surfaces. This stage-by-stage visualization teaches users, children, and students the engineering logic, geometry, and structural balance behind what they imagine, turning creative play into an engaging learning experience.

Users interact with a supportive AI Creative Partner that listens to their voice, recognizes their unique profile, and materializes complex 3D models in a shared virtual space—whether building an educational model of a futuristic flying vehicle, sculpting a superhero, or co-creating digital worlds with peers across the globe.

---

## 2. Core System Architecture & Topology

[ User Spoken / Text / Image Input ] ---> [ Speaker ID & STT / Vision Pipeline ]
|
v
[ LLM Intent & Scene Parser ]
|
v
+------------------------------------------------+------------------------------------------------+
|                                                                                                 |
v                                                                                                 v
[ Spatial Asset Inference Engine ]                                               [ Spatial Scene Graph Engine ]
(Tripo3D / Meshy API / Image-to-3D)                                              (Three.js / React Three Fiber)
|                                                                                                 |
+------------------------------------------------+------------------------------------------------+
|
v
[ Real-Time Convergence Hub ]
(Socket.io / Social Statuses / Collaboration)


### Core Subsystems

1. **Voice Biometrics & Conversational Partner**
   * **Speaker Identification & Profile Sync:** Voiceprint authentication (SpeechBrain / Azure Speaker Recognition) to load user profiles, saved 3D worlds, and preferences.
   * **Multilingual Speech-to-Text:** Low-latency transcription via Whisper API and Web Speech API for accent-resilient voice command processing.
   * **Pedagogical AI Agent:** Conversational orchestrator that provides guided prompts, engineering feedback, and creative inspiration.

2. **Spontaneous 3D & Spatial Generation Engine**
   * **WebGL Rendering Viewport:** Built using Three.js and `@react-three/fiber` for high-performance rendering across desktop, mobile, and low-spec hardware.
   * **Stage-by-Stage Visual Assembly:** Step-by-step rendering pipeline revealing Point Cloud → Wireframe Mesh → High-Poly 4K Textured Asset to foster engineering curiosity.
   * **Generative Mesh & Image-to-3D Pipeline:** Text-to-3D and Image-to-3D inference hooks (Meshy AI / Tripo3D) that convert user uploaded photos or sketches into stylized 3D assets or cartoon models.

3. **Multiplayer Convergence & Social Ecosystem**
   * **24-Hour Ephemeral Status Updates (WhatsApp-style):** A dedicated social feed where users post 3D snapshots, prompt recipes, or animated builds that expire after 24 hours. Peers can view, like, and cheer updates.
   * **Friend List & Direct Messaging:** Connect with friends, exchange prompt recipes, and share project links.
   * **Real-Time Collaborative Room (Socket.io):** Multi-user canvas where team members co-create in a shared 3D room, complete with integrated text/voice planning chat.
   * **Persistence & Export Layer:** Cloud storage and database state saving for instant retrieval and multi-format exporting (`.glb`, `.usdz` for AR).

---

## 3. Project Directory Structure

my-creative-partner/
├── creative-partner-app/      # Frontend Client (React, Three.js / R3F, Lucide, Vite)
│   ├── src/
│   │   ├── components/        # Sidebar, AuthModal, LandingPage, Social Overlays
│   │   ├── App.jsx            # Core Viewport, Speech Pipeline, Tab Navigator
│   │   └── main.jsx           # Entry point
├── server/                    # Backend API & Relay Gateway (Node.js, Express, Socket.io)
│   ├── index.js               # Generative proxy routes & WebSocket handlers
│   └── .env                   # Environment keys & API credentials
└── AGENT.md                   # Unified Blueprint and Master Documentation


---

## 4. Implementation Status & Master Roadmap

### Completed Features
- [x] **React Three Fiber (R3F) WebGL Viewport:** Supports ambient lighting, ground plane, camera orbit controls, and dynamic skybox environments (Day, Night, Neon).
- [x] **Voice & Text Command Processing:** Integrated Web Speech API with Web Audio fallback to parse incoming creative intents.
- [x] **Glassmorphism Interface:** Sidebar navigation, responsive layout tabs, modal authentication overlay, and status monitors.
- [x] **Backend API Gateway:** Express relay server listening on `http://localhost:5000` handling generative requests and health checks.
- [x] **Dynamic GLTF Model Rendering Engine:** `useGLTF` integration ready for live mesh streaming.

### Phase 1: Real-time Generative 3D & Pedagogical Assembly (In Progress)
- [ ] **Step-by-Step Build Pipeline:** Visual assembly animation (Point Cloud → Wireframe → 4K Textured GLB) so users observe the structural evolution.
- [ ] **Live 4K Generative API Integration:** Connect live Meshy.ai / Tripo3D credentials via Express proxy.
- [ ] **Image-to-3D & Cartoon Stylizer:** Upload 2D pictures/photos and transform them into interactive 3D assets.

### Phase 2: Social Ecosystem & 24-Hour Ephemeral Statuses
- [ ] **Ephemeral Status Feed (WhatsApp-style):** Share 3D snapshots, prompt recipes, or short animations that expire in 24 hours.
- [ ] **Social Interactions:** Likes, cheers, and comment threads on peer status posts.
- [ ] **Friend List & Direct Chat:** Add peers and exchange creative ideas in real time.

### Phase 3: Collaborative Multi-User Canvas & Spatial Physics
- [ ] **Multi-User Real-time Workspace (Socket.io):** Collaborative 3D rooms where multiple creators build together.
- [ ] **In-Room Voice & Text Chat:** Integrated communication for team planning and joint spatial building.
- [ ] **Cross-Platform Exporting:** Export creations as standard `.glb`, `.usdz` (AR ready), or shareable web links.

---

## 5. Tech Stack

* **Frontend:** React, Three.js / `@react-three/fiber`, `@react-three/drei`, Lucide Icons, Vite
* **Backend:** Node.js / Express, Socket.io (WebSockets)
* **AI/ML Layer:** Whisper API, Speaker Biometrics, Generative 3D Mesh APIs (Meshy AI / Tripo3D / Shap-E)
* **Real-Time Engine:** WebSockets / Socket.io
* **Storage & Persistence:** PostgreSQL / MongoDB, Cloud Asset Buckets