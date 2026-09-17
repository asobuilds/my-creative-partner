/**
 * Short-circuit services that returned a credit/auth error recently.
 * Prevents every prompt from wasting 2-3s on calls that will 100% fail.
 */

const FAILED = new Map();  // service -> timestamp of failure
const TTL_MS = 6 * 60 * 60 * 1000;  // 6 hours

export function isDisabled(service) {
  const t = FAILED.get(service);
  if (!t) return false;
  if (Date.now() - t > TTL_MS) { FAILED.delete(service); return false; }
  return true;
}

export function markFailed(service, reason) {
  FAILED.set(service, Date.now());
  console.log('[creditGuard] disabled ' + service + ' for 6h — ' + reason);
}

export function shouldTry(service) {
  return !isDisabled(service);
}

export function reset(service) {
  if (service) FAILED.delete(service);
  else FAILED.clear();
}
