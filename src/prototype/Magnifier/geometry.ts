import type { MagnifierRegion } from './types'

export interface Point {
  x: number
  y: number
}

export interface TargetGeometry {
  rect: DOMRect
  /** Spatial region. Defaults to 'content' when omitted. */
  region?: MagnifierRegion
}

/** Pixels of slack added to a region boundary so a target's own edge counts. */
export const REGION_MARGIN_PX = 10

export function pointInRect(p: Point, r: DOMRect): boolean {
  return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom
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

/**
 * Decide which region the pointer is in, derived from the targets' own extents
 * so it adapts to the live layout. The dock occupies the left rail, the tabs a
 * top band; everything to the right of the dock and below the tabs is content.
 * A small margin lets a target's own edge count as still inside its region.
 */
export function regionOfPoint(
  point: Point,
  targets: Map<string, TargetGeometry>,
  margin: number = REGION_MARGIN_PX,
): MagnifierRegion {
  let dockRight = -Infinity
  let tabBottom = -Infinity
  let hasDock = false
  let hasTabs = false
  for (const t of targets.values()) {
    const region = t.region ?? 'content'
    if (region === 'dock') {
      hasDock = true
      if (t.rect.right > dockRight) dockRight = t.rect.right
    } else if (region === 'tabs') {
      hasTabs = true
      if (t.rect.bottom > tabBottom) tabBottom = t.rect.bottom
    }
  }
  if (hasDock && point.x <= dockRight + margin) return 'dock'
  if (hasTabs && point.y <= tabBottom + margin) return 'tabs'
  return 'content'
}

/**
 * The magnifier hit-test. Three rules, in order:
 *
 *   1. Region gating: only targets in the pointer's region compete, so a wide
 *      content row is never out-competed by a dock icon or a tab that merely
 *      sits nearer by centre distance. This is the fix for the axis overlap
 *      where dragging down a list could switch apps.
 *   2. Membrane hold: keep the current lock while the pointer is still inside
 *      its (magnified) bounds. The grown rect of the locked cell IS the
 *      membrane, so the hold is grounded in real geometry, not a fixed radius.
 *   3. Containment, then nearest centre: lock whatever sits under the finger
 *      (smallest rect wins when nested); fall back to nearest centre, with the
 *      usual hysteresis, only when the pointer is in a gap between targets.
 */
export function pickMagnifierTarget(
  point: Point,
  targets: Map<string, TargetGeometry>,
  currentLockId: string | null,
  fraction: number,
): string | null {
  if (targets.size === 0) return null

  const region = regionOfPoint(point, targets)
  const candidates = new Map<string, TargetGeometry>()
  for (const [id, t] of targets) {
    if ((t.region ?? 'content') === region) candidates.set(id, t)
  }
  if (candidates.size === 0) return null

  // Membrane hold: stay on the current lock while still inside its bounds.
  if (currentLockId && candidates.has(currentLockId)) {
    const cur = candidates.get(currentLockId)!
    if (pointInRect(point, cur.rect)) return currentLockId
  }

  // Containment: the smallest target physically under the finger.
  let contained: { id: string; area: number } | null = null
  for (const [id, t] of candidates) {
    if (pointInRect(point, t.rect)) {
      const area = t.rect.width * t.rect.height
      if (!contained || area < contained.area) contained = { id, area }
    }
  }
  if (contained) return contained.id

  // Gap: nearest centre within the region, with membrane hysteresis.
  return pickLockedTarget(
    point,
    candidates,
    currentLockId && candidates.has(currentLockId) ? currentLockId : null,
    fraction,
  )
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
