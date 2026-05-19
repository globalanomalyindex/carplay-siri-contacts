export interface Point {
  x: number
  y: number
}

export interface TargetGeometry {
  rect: DOMRect
}

export function rectCenter(r: DOMRect): Point {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function distance(p: Point, r: DOMRect): number {
  const c = rectCenter(r)
  return Math.hypot(p.x - c.x, p.y - c.y)
}

export function pickLockedTarget(
  point: Point,
  targets: Map<string, TargetGeometry>,
  currentLockId: string | null,
  fraction: number,
): string | null {
  if (targets.size === 0) return null

  let nearestId: string | null = null
  let nearestDist = Infinity
  for (const [id, t] of targets) {
    const d = distance(point, t.rect)
    if (d < nearestDist) {
      nearestDist = d
      nearestId = id
    }
  }

  if (!currentLockId || !targets.has(currentLockId)) return nearestId
  if (nearestId === currentLockId) return currentLockId

  const cur = targets.get(currentLockId)!
  const nxt = targets.get(nearestId!)!
  if (isPastHysteresis(point, cur.rect, nxt.rect, fraction)) {
    return nearestId
  }
  return currentLockId
}

export function isPastHysteresis(
  point: Point,
  from: DOMRect,
  to: DOMRect,
  fraction: number,
): boolean {
  const a = rectCenter(from)
  const b = rectCenter(to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return false
  const px = point.x - a.x
  const py = point.y - a.y
  const dot = (px * dx + py * dy) / len
  const t = dot / len
  return t >= fraction
}

export type GestureDirection = 'horizontal' | 'vertical' | 'idle'

/**
 * Decide whether a recent pointer trail reads as a horizontal sweep, a
 * vertical drag, or no clear direction. Sums absolute deltas between
 * consecutive samples; if the total motion is below `minTotalPx` the
 * direction is 'idle'. Otherwise compares horizontal and vertical
 * fractions of the total motion. Horizontal wins when its fraction
 * exceeds `dominantFraction`; vertical wins on the reverse condition;
 * otherwise the gesture is ambiguous and reported as 'idle'.
 *
 * Used by PhoneApp to suppress the tab pass-through preview when the
 * user is dragging vertically toward a row (the lockedId may pass
 * through a tab on the way down, but the tab preview must not fire).
 */
export function computeGestureDirection(
  samples: readonly Point[],
  options: { minTotalPx?: number; dominantFraction?: number } = {},
): GestureDirection {
  const { minTotalPx = 8, dominantFraction = 0.6 } = options
  if (samples.length < 2) return 'idle'
  let totalH = 0
  let totalV = 0
  for (let i = 1; i < samples.length; i++) {
    totalH += Math.abs(samples[i].x - samples[i - 1].x)
    totalV += Math.abs(samples[i].y - samples[i - 1].y)
  }
  const total = totalH + totalV
  if (total < minTotalPx) return 'idle'
  if (totalH / total > dominantFraction) return 'horizontal'
  if (totalV / total > dominantFraction) return 'vertical'
  return 'idle'
}
