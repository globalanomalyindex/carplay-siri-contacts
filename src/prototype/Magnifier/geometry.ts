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
