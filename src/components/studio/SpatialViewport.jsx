import React, { Suspense, useEffect, useRef, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../store/studioStore';
import { Camera, Layers, Move3D, RotateCw, Maximize2, Trash2, Copy } from 'lucide-react';
import ImagePlane from './ImagePlane';

class GLBErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e) { console.warn('GLB load failed:', e); }
  render() { return this.state.failed ? null : this.props.children; }
}

function GLBModel({ url, position }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [url, invalidate]);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(dt * 4, 1));
      ref.current.rotation.y += dt * 0.2;
    }
  });
  const cloned = React.useMemo(() => {
    try { return scene.clone(); } catch (e) { return scene; }
  }, [scene]);
  return <primitive ref={ref} object={cloned} position={position || [0, 0.8, 0]} scale={0.01} />;
}

function PrimitiveEntity({ object }) {
  const ref = useRef();
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [object, invalidate]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const t = object.growth == null ? 1 : object.growth;
    ref.current.scale.lerp(new THREE.Vector3(t, t, t), Math.min(dt * 4, 1));
    if (object.spin) ref.current.rotation.y += dt * object.spin;
  });
  const color = object.color || '#00f0ff';
  const geom = (() => {
    switch (object.kind) {
      case 'sphere': return <sphereGeometry args={[0.6, 32, 16]} />;
      case 'torus':  return <torusGeometry args={[0.5, 0.18, 16, 48]} />;
      case 'cylinder': return <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1.2, 32]} />;
      case 'octahedron': return <octahedronGeometry args={[0.7, 0]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.7, 0]} />;
      case 'torusKnot': return <torusKnotGeometry args={[0.5, 0.15, 64, 12]} />;
      default: return <boxGeometry args={[1, 1, 1, 2, 2, 2]} />;
    }
  })();
  return (
    <mesh ref={ref} position={object.position || [0, 0.8, 0]} scale={0.01}>
      {geom}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={object.emissive == null ? 0.35 : Math.min(object.emissive, 1.2)} roughness={object.roughness == null ? 0.35 : object.roughness} metalness={object.metalness == null ? 0.4 : object.metalness} />
    </mesh>
  );
}

function SceneContents({ selectedId, onSelect }) {
  const objects = useStudioStore((s) => s.sceneObjects);
  const mood = useStudioStore((s) => s.mood);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [objects, mood, invalidate]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <pointLight position={[-6, 3, -4]} intensity={0.5} color={mood.accent} />
      {objects.map((o) => {
        if (o.kind === 'image' && o.imageUrl) {
          return (
            <Suspense key={o.id} fallback={null}>
              <ImagePlane object={o} selected={selectedId === o.id} onSelect={onSelect} />
            </Suspense>
          );
        }
        if (o.modelUrl) {
          return <GLBErrorBoundary key={o.id}><GLBModel url={o.modelUrl} position={o.position} /></GLBErrorBoundary>;
        }
        return <PrimitiveEntity key={o.id} object={o} />;
      })}
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={2} maxDistance={30} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

export default function SpatialViewport({ className }) {
  const streamStatus = useStudioStore((s) => s.streamStatus);
  const phase = useStudioStore((s) => s.phase);
  const mood = useStudioStore((s) => s.mood);
  const lastRender = useStudioStore((s) => s.lastRender);
  const [showRender, setShowRender] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (lastRender && lastRender.preview) setShowRender(true);
    if (lastRender && lastRender.glb && !lastRender.preview) setShowRender(false);
  }, [lastRender]);

  // Keyboard: Delete removes selected image, Escape deselects
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedId) return;
      if (e.key === 'Escape') { setSelectedId(null); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const store = useStudioStore.getState();
        const filtered = store.sceneObjects.filter((o) => o.id !== selectedId);
        useStudioStore.setState({ sceneObjects: filtered });
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const active = streamStatus === 'open' || phase === 'streaming' || phase === 'building' || phase === 'rendering';

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', background: '#050810', overflow: 'hidden' }}>
      {showRender && lastRender && lastRender.preview ? (
        <>
          <img src={lastRender.preview} alt="render" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#050810' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5 }}>
            <button onClick={() => setShowRender(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'rgba(9,13,22,0.9)', backdropFilter: 'blur(14px)', border: '1px solid ' + mood.primary + '55', color: mood.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              <Layers size={13} /> Live 3D
            </button>
          </div>
        </>
      ) : (
        <>
          <Canvas
            shadows={false}
            dpr={[1, 1.5]}
            frameloop={active ? 'always' : 'demand'}
            gl={{ antialias: true, alpha: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false }}
            camera={{ position: [0, 2.4, 6.5], fov: 48, near: 0.1, far: 200 }}
            onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
          >
            <color attach="background" args={[mood.bg]} />
            <Suspense fallback={null}>
              <SceneContents selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
          </Canvas>
          {lastRender && lastRender.preview && (
            <button onClick={() => setShowRender(true)} style={{ position: 'absolute', top: 12, right: 12, zIndex: 5, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'rgba(9,13,22,0.9)', backdropFilter: 'blur(14px)', border: '1px solid ' + mood.primary + '55', color: mood.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              <Camera size={13} /> Blender Render
            </button>
          )}
        </>
      )}
      {selectedId && (() => {
        const sel = useStudioStore.getState().sceneObjects.find((o) => o.id === selectedId);
        if (!sel) return null;
        const store = useStudioStore.getState();
        const btn = (icon, label, onClick, color) => (
          <button onClick={onClick} title={label} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(10,8,18,0.92)', border: '1px solid ' + (color || '#ffffff22'), color: color || '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </button>
        );
        return (
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, padding: 8, borderRadius: 16, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 20 }}>
            {btn(<Move3D size={16} />, 'Move (G)', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' })))}
            {btn(<RotateCw size={16} />, 'Rotate (R)', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' })))}
            {btn(<Maximize2 size={16} />, 'Scale (S)', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' })))}
            {btn(<Copy size={16} />, 'Duplicate (D)', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' })))}
            {btn(<Trash2 size={16} />, 'Delete', () => { store.deleteSceneObject(selectedId); setSelectedId(null); }, '#ef4444')}
          </div>
        );
      })()}
    </div>
  );
}
