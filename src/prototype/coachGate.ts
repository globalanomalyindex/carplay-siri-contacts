/**
 * One-time gate for the first-run coach. The demonstration plays once per
 * visit: a module-level flag is the source of truth within a single document,
 * and a sessionStorage mirror carries the "already played" state across a soft
 * route change (standalone /prototype <-> embedded case study) so a reader who
 * has seen it once never sees it again this session.
 */
let coachPlayed = false
const COACH_KEY = 'carplay.coachPlayed'

export function hasPlayedCoach(): boolean {
  if (coachPlayed) return true
  try {
    if (sessionStorage.getItem(COACH_KEY) === '1') {
      coachPlayed = true
      return true
    }
  } catch {
    /* sessionStorage may be unavailable (private mode, SSR); fall back to the flag. */
  }
  return false
}

export function markCoachPlayed(): void {
  coachPlayed = true
  try {
    sessionStorage.setItem(COACH_KEY, '1')
  } catch {
    /* ignore: the module flag still gates the rest of this session. */
  }
}

/**
 * Test-only reset so the gating can be exercised across renders without a fresh
 * module instance. Never called by app code.
 */
export function resetCoachGate(): void {
  coachPlayed = false
  try {
    sessionStorage.removeItem(COACH_KEY)
  } catch {
    /* ignore */
  }
}
