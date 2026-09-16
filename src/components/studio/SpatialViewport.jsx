import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../store/studioStore';

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
      case 'sphere': return <sphereGeometry args={[0.6, 24, 24]} />;
      case 'torus':  return <torusGeometry args={[0.5, 0.18, 16, 48]} />;
      case 'cylinder': return <cylinderGeometry args={[0.4, 0.4, 1.2, 24]} />;
      case 'cone': return <coneGeometry args={[0.5, 1.2, 24]} />;
      case 'octahedron': return <octahedronGeometry args={[0.7, 0]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.7, 0]} />;
      case 'torusKnot': return <torusKnotGeometry args={[0.5, 0.15, 48, 8]} />;
      default: return <boxGeometry args={[1, 1, 1, 2, 2, 2]} />;
    }
  })();

  return (
    <mesh ref={ref} position={object.position || [0, 0.8, 0]} scale={0.01}>
      {geometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={object.emissive == null ? 0.4 : object.emissive}
        roughness={object.roughness == null ? 0.4 : object.roughness}
        metalness={object.metalness == null ? 0.5 : object.metalness}
      />
      {object.label && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{object.label}</div>
        </Html>
      )}
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
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <pointLight position={[-6, 3, -4]} intensity={0.6} color={mood.accent} />
      {objects.map((o) => (<SceneEntity key={o.id} object={o} />))}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.35} scale={18} blur={2} far={4} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={2} maxDistance={20} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

export default function SpatialViewport({ className }) {
  const streamStatus = useStudioStore((s) => s.streamStatus);
  const phase = useStudioStore((s) => s.phase);
  const mood = useStudioStore((s) => s.mood);

  const active = streamStatus === 'open' || phase === 'streaming' || phase === 'building' || phase === 'rendering';

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        frameloop={active ? 'always' : 'demand'}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'low-power',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{ position: [0, 2.4, 6.5], fov: 48, near: 0.1, far: 200 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={[mood.bg]} />
        <fog attach="fog" args={[mood.fog, 12, 42]} />
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
