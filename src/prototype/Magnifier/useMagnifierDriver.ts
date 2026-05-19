import { useCallback, useEffect, useRef } from 'react'
import { useMagnifierInternal } from './MagnifierProvider'
import { pickLockedTarget, type TargetGeometry, type Point } from './geometry'
import { space } from '../../tokens/spatial'

export interface MagnifierDriver {
  start: () => void
  move: (p: Point) => void
  end: (p: Point) => string | null
}

export function useMagnifierDriver(): MagnifierDriver {
  const { getTargets, setLockedId, setRotaryActive } = useMagnifierInternal()
  const currentLockRef = useRef<string | null>(null)
  const currentFreeRef = useRef<string | null>(null)

  // Snap (discrete) targets only, used by pickLockedTarget.
  const computeSnapGeometryMap = useCallback((): Map<string, TargetGeometry> => {
    const out = new Map<string, TargetGeometry>()
    const targets = getTargets()
    for (const [id, t] of targets) {
      if (t.behavior !== 'snapToCenter') continue
      const el = t.ref.current
      if (!el) continue
      out.set(id, { rect: el.getBoundingClientRect() })
    }
    return out
  }, [getTargets])

  // FreeDrift target whose bounding rect contains the point.
  // Prefers the smallest matching rect when targets are nested.
  const findFreeDriftAtPoint = useCallback(
    (p: Point): string | null => {
      let found: { id: string; area: number } | null = null
      const targets = getTargets()
      for (const [id, t] of targets) {
        if (t.behavior !== 'freeDrift') continue
        const el = t.ref.current
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) {
          const area = r.width * r.height
          if (!found || area < found.area) found = { id, area }
        }
      }
      return found ? found.id : null
    },
    [getTargets],
  )

  const start = useCallback(() => {
    currentLockRef.current = null
    currentFreeRef.current = null
    setLockedId(null)
    setRotaryActive(true)
  }, [setLockedId, setRotaryActive])

  const move = useCallback(
    (p: Point) => {
      const geom = computeSnapGeometryMap()
      const lockId = pickLockedTarget(
        p,
        geom,
        currentLockRef.current,
        space.membraneHysteresisFraction,
      )
      if (lockId !== currentLockRef.current) {
        currentLockRef.current = lockId
        setLockedId(lockId)
      }
      // Only track freeDrift target while not snap-locked.
      currentFreeRef.current = lockId ? null : findFreeDriftAtPoint(p)
    },
    [computeSnapGeometryMap, findFreeDriftAtPoint, setLockedId],
  )

  const end = useCallback(
    (p: Point): string | null => {
      move(p)
      const snapId = currentLockRef.current
      const freeId = currentFreeRef.current
      if (snapId) {
        const target = getTargets().get(snapId)
        if (target) target.onCommit({ x: p.x, y: p.y })
      } else if (freeId) {
        const target = getTargets().get(freeId)
        if (target) target.onCommit({ x: p.x, y: p.y })
      }
      currentLockRef.current = null
      currentFreeRef.current = null
      setLockedId(null)
      setRotaryActive(false)
      return snapId ?? freeId
    },
    [move, getTargets, setLockedId, setRotaryActive],
  )

  useEffect(() => {
    return () => {
      setLockedId(null)
      setRotaryActive(false)
    }
  }, [setLockedId, setRotaryActive])

  return { start, move, end }
}
