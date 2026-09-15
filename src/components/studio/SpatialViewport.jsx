import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../store/studioStore';
import { useResponsive } from '../../hooks/useResponsive';

/* ── Individual scene entity ─────────────────────────── */
function SceneEntity({ object }) {
  const ref = useRef();
  const { invalidate } = useThree();

  useEffect(() => { invalidate(); }, [object, invalidate]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = object.growth ?? 1;
    ref.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      Math.min(dt * 4, 1)
    );
    if (object.spin) ref.current.rotation.y += dt * object.spin;
  });

  const color = object.color ?? '#00f0ff';

  const geometry = useMemo(() => {
    switch (object.kind) {
      case 'sphere':  return <sphereGeometry args={[0.6, 48, 48]} />;
      case 'torus':   return <torusGeometry args={[0.5, 0.18, 32, 96]} />;
      case 'cloud':   return <icosahedronGeometry args={[0.7, 3]} />;
      default:        return <boxGeometry args={[1, 1, 1, 4, 4, 4]} />;
    }
  }, [object.kind]);

  return (
    <mesh ref={ref} position={object.position ?? [0, 0.6, 0]} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={object.emissive ?? 0.35}
        roughness={0.28}
        metalness={0.65}
      />
      {object.label && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div style={{
            color: '#e2e8f0', fontSize: 12, fontWeight: 700,
            letterSpacing: 0.5, whiteSpace: 'nowrap',
            textShadow: `0 0 12px ${color}`,
          }}>{object.label}</div>
        </Html>
      )}
    </mesh>
  );
}

/* ── Store subscription + progressive detail ─────────── */
function SceneContents({ quality }) {
  const objects = useStudioStore((s) => s.sceneObjects);
  const { invalidate } = useThree();

  useEffect(() => { invalidate(); }, [objects, invalidate]);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, -4]} intensity={0.7} color="#3b82f6" />
      <Environment preset="city" />

      {objects.map((o) => (
        <SceneEntity key={o.id} object={{ ...o, spin: quality === 'low' ? 0 : o.spin }} />
      ))}

      <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={22} blur={2.4} far={4} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export default function SpatialViewport({ className }) {
  const { isMobile, dpr } = useResponsive();
  const isStreaming = useStudioStore((s) => s.streamStatus === 'open');

  // Cap DPR harder on mobile to save GPU bandwidth
  const resolvedDpr = useMemo(
    () => Math.min(dpr, isMobile ? 1.5 : 2),
    [dpr, isMobile]
  );

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows={!isMobile}
        dpr={resolvedDpr}
        frameloop={isStreaming ? 'always' : 'demand'}   /* ← on-demand when idle */
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,                   /* needed for story snapshots */
        }}
        camera={{ position: [0, 2.4, 6.5], fov: 48, near: 0.1, far: 200 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={['#070b14']} />
        <fog attach="fog" args={['#070b14', 12, 42]} />
        <Suspense fallback={null}>
          <SceneContents quality={isMobile ? 'low' : 'high'} />
        </Suspense>
      </Canvas>
    </div>
  );
}