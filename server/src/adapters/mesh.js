export const meshReady = true;

const KINDS = ['box', 'sphere', 'torus', 'cloud', 'cylinder', 'cone', 'octahedron', 'dodecahedron', 'torusKnot'];

export function normalizeShape(input) {
  const s = input && typeof input === 'object' ? input : {};
  const kind = KINDS.includes(s.kind) ? s.kind : 'cloud';
  return {
    kind,
    color: typeof s.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.color) ? s.color : '#00f0ff',
    emissive: typeof s.emissive === 'number' ? Math.max(0, Math.min(2, s.emissive)) : 0.4,
    roughness: typeof s.roughness === 'number' ? Math.max(0, Math.min(1, s.roughness)) : 0.28,
    metalness: typeof s.metalness === 'number' ? Math.max(0, Math.min(1, s.metalness)) : 0.65,
    scale: typeof s.scale === 'number' ? Math.max(0.2, Math.min(4, s.scale)) : 1,
    spin: typeof s.spin === 'number' ? s.spin : 0.35,
    wireframe: Boolean(s.wireframe),
    opacity: typeof s.opacity === 'number' ? Math.max(0.1, Math.min(1, s.opacity)) : 1,
  };
}

export async function generateMesh(_prompt) {
  return null;
}
