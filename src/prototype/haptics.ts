/**
 * A single, capability-checked haptic tick for a fresh magnifier lock. Drivers
 * watching the road get a confirmation they do not have to look for: a 10ms
 * pulse the moment the lens settles on a new target.
 *
 * It is deliberately conservative. It fires only on a fresh lock (never on
 * every pointer sample), only when the platform exposes the Vibration API, and
 * never when the caller has reduced motion on (a buzzing device is itself
 * motion the user asked to avoid). Returns whether a pulse was actually fired
 * so callers and tests can assert the gate.
 */
const LOCK_TICK_MS = 10

export function lockHaptic(reduced: boolean): boolean {
  if (reduced) return false
  if (typeof navigator === 'undefined') return false
  const vibrate = navigator.vibrate
  if (typeof vibrate !== 'function') return false
  try {
    return vibrate.call(navigator, LOCK_TICK_MS)
  } catch {
    return false
  }
}
