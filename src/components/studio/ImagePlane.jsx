import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../store/studioStore';

export default function ImagePlane({ object, selected, onSelect }) {
  const meshRef = useRef();
  const { invalidate, camera, gl } = useThree();
  const [mode, setMode] = useState('translate');
  const patchSceneObject = useStudioStore((s) => s.patchSceneObject);

  const texture = useLoader(THREE.TextureLoader, object.imageUrl, (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      invalidate();
    }
  }, [texture, invalidate]);

  // Keyboard shortcuts when this item is selected
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === 'g' || e.key === 'G') setMode('translate');
      if (e.key === 'r' || e.key === 'R') setMode('rotate');
      if (e.key === 's' || e.key === 'S') setMode('scale');
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); handleDuplicate(); }
      if (e.key === 'Escape') onSelect && onSelect(null);
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleDelete(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleDelete = () => {
    const store = useStudioStore.getState();
    useStudioStore.setState({ sceneObjects: store.sceneObjects.filter((o) => o.id !== object.id) });
    onSelect && onSelect(null);
  };

  const handleDuplicate = () => {
    const store = useStudioStore.getState();
    const newId = 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const p = object.position || [0, 1, 0];
    store.upsertSceneObject({
      ...object,
      id: newId,
      position: [p[0] + 0.6, p[1], p[2] + 0.6],
    });
    onSelect && onSelect(newId);
  };

  const handleChange = () => {
    if (!meshRef.current) return;
    const m = meshRef.current;
    patchSceneObject(object.id, {
      position: [m.position.x, m.position.y, m.position.z],
      rotation: [m.rotation.x, m.rotation.y, m.rotation.z],
      scale: Math.max(m.scale.x, 0.1),
    });
    invalidate();
  };

  const size = object.scale || 1.5;

  return (
    <>
      <mesh
        ref={meshRef}
        position={object.position || [0, 1, 0]}
        rotation={object.rotation || [0, 0, 0]}
        scale={object.scale ? [object.scale / 1.5, object.scale / 1.5, object.scale / 1.5] : [1, 1, 1]}
        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(object.id); }}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} toneMapped={false} />
        {selected && (
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[1.58, 1.58]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
      </mesh>

      {selected && (
        <TransformControls
          object={meshRef}
          mode={mode}
          onMouseUp={handleChange}
          size={0.7}
        />
      )}
    </>
  );
}
