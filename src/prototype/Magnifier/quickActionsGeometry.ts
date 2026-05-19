import type { QuickActionPosition } from './types'

/**
 * Hysteresis radius. The pointer must move at least this far from the
 * anchor center in some cardinal direction to highlight a chip. Below
 * this, no chip is targeted (committing here = dismiss with no action).
 */
export const QUICK_ACTIONS_DEADZONE = 24

/**
 * Classify the pointer's offset from the anchor into one of the four
 * cardinal directions, OR null when inside the deadzone. Compares the
 * dominant axis: if |dx| >= |dy|, horizontal wins.
 *
 * Exposed separately from the React component so it can be unit-tested
 * and to satisfy react-refresh's component-only export rule.
 */
export function pickQuickActionDirection(
  anchor: { x: number; y: number },
  point: { x: number; y: number },
  deadzone: number = QUICK_ACTIONS_DEADZONE,
): QuickActionPosition | null {
  const dx = point.x - anchor.x
  const dy = point.y - anchor.y
  const dist = Math.hypot(dx, dy)
  if (dist < deadzone) return null
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'right' : 'left'
  }
  return dy >= 0 ? 'down' : 'up'
}
