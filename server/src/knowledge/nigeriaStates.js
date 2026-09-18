/**
 * Nigeria's 36 states + FCT mapped to their dominant culture.
 * Used to ground children in their own geographical context,
 * regardless of their family's heritage culture.
 */

export const STATE_TO_CULTURE = {
  // South-West — Yoruba
  lagos: 'yoruba', ogun: 'yoruba', oyo: 'yoruba', osun: 'yoruba',
  ondo: 'yoruba', ekiti: 'yoruba', kwara: 'yoruba',
  // South-East — Igbo
  anambra: 'igbo', enugu: 'igbo', imo: 'igbo', abia: 'igbo', ebonyi: 'igbo',
  // South-South
  'cross river': 'efik', 'akwa ibom': 'ibibio',
  bayelsa: 'ijaw', rivers: 'ijaw', delta: 'ijaw',
  edo: 'edo',
  // North-West / North-Central — Hausa
  kano: 'hausa', katsina: 'hausa', sokoto: 'hausa', kebbi: 'hausa',
  zamfara: 'hausa', kaduna: 'hausa', jigawa: 'hausa',
  bauchi: 'hausa', gombe: 'hausa',
  // North-East
  yobe: 'kanuri', borno: 'kanuri',
  // Middle Belt
  benue: 'idoma', nasarawa: 'tiv', plateau: 'tiv',
  taraba: 'fulani', adamawa: 'fulani',
  kogi: 'igala', niger: 'nupe',
  // Capital
  fct: 'mixed', abuja: 'mixed', 'federal capital territory': 'mixed',
};

export function cultureFromState(state) {
  if (!state) return null;
  const key = String(state).toLowerCase().trim();
  return STATE_TO_CULTURE[key] || null;
}

export function stateFromRegion(region) {
  if (!region) return null;
  return String(region).trim();
}
