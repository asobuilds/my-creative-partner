import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../store/studioStore';
import { Camera, Layers } from 'lucide-react';

function DynamicModel({ url, position }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [url, invalidate]);
  useFrame((_, dt) => {
    if (ref.current) {
      const t = 1;
      ref.current.scale.lerp(new THREE.Vector3(t, t, t), Math.min(dt * 4, 1));
      ref.current.rotation.y += dt * 0.35;
    }
  });
  return <primitive ref={ref} object={scene.clone()} position={position} scale={0.01} />;
}

function SceneEntity({ object }) {
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
  const geometry = (() => {
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
      {geometry}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={object.emissive == null ? 0.35 : Math.min(object.emissive, 1.2)} roughness={object.roughness == null ? 0.35 : object.roughness} metalness={object.metalness == null ? 0.4 : object.metalness} />
      {object.label && <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}><div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{object.label}</div></Html>}
    </mesh>
  );
}

function SceneContents() {
  const objects = useStudioStore((s) => s.sceneObjects);
  const mood = useStudioStore((s) => s.mood);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [objects, mood, invalidate]);
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} />
      <pointLight position={[-6, 3, -4]} intensity={0.6} color={mood.accent} />
      {objects.map((o) => {
        if (o.modelUrl) return <DynamicModel key={o.id} url={o.modelUrl} position={o.position || [0, 0.8, 0]} />;
        return <SceneEntity key={o.id} object={o} />;
      })}
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={2} maxDistance={20} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

export default function SpatialViewport({ className }) {
  const streamStatus = useStudioStore((s) => s.streamStatus);
  const phase = useStudioStore((s) => s.phase);
  const mood = useStudioStore((s) => s.mood);
  const lastRender = useStudioStore((s) => s.lastRender);
  const [showRender, setShowRender] = useState(true);

  useEffect(() => {
    if (lastRender && (lastRender.glb || lastRender.preview)) setShowRender(true);
  }, [lastRender]);

  const active = streamStatus === 'open' || phase === 'streaming' || phase === 'building' || phase === 'rendering';

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', background: '#050810', overflow: 'hidden' }}>
      {(showRender && lastRender && lastRender.preview) ? (
        <>
          <img src={lastRender.preview} alt="Blender render" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#050810', animation: 'fadeIn .5s ease-out' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5, display: 'flex', gap: 6 }}>
            <button onClick={() => setShowRender(false)} title="Show live 3D" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'rgba(9,13,22,0.9)', backdropFilter: 'blur(14px)', border: '1px solid ' + mood.primary + '55', color: mood.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              <Layers size={13} /> Live 3D
            </button>
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
      ) : (
        <>
          <Canvas shadows={false} dpr={[1, 1.5]} frameloop={active ? 'always' : 'demand'} gl={{ antialias: true, alpha: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false }} camera={{ position: [0, 2.4, 6.5], fov: 48, near: 0.1, far: 200 }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}>
            <color attach="background" args={[mood.bg]} />
            <Suspense fallback={null}><SceneContents /></Suspense>
          </Canvas>
          {lastRender && lastRender.preview && (
            <button onClick={() => setShowRender(true)} title="Show Blender render" style={{ position: 'absolute', top: 12, right: 12, zIndex: 5, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'rgba(9,13,22,0.9)', backdropFilter: 'blur(14px)', border: '1px solid ' + mood.primary + '55', color: mood.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              <Camera size={13} /> Blender Render
            </button>
          )}
        </>
      )}
      {phase === 'rendering' && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', borderRadius: 20, background: 'rgba(9,13,22,0.9)', backdropFilter: 'blur(14px)', border: '1px solid ' + mood.primary + '55', color: mood.primary, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: mood.primary, animation: 'pulse 1s infinite' }} />
          Generating model…
          <style>{`@keyframes pulse { 50% { opacity: 0.3 } }`}</style>
        </div>
      )}
    </div>
  );
}
