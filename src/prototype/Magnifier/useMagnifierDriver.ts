import { useCallback, useEffect, useRef } from 'react'
import { useMagnifierInternal } from './MagnifierContext'
import {
  pickLockedTarget,
  computeGestureDirection,
  type TargetGeometry,
  type Point,
} from './geometry'
import { space } from '../../tokens/spatial'

/** Last N pointer samples used to classify gesture direction. */
const GESTURE_SAMPLE_WINDOW = 5

export interface MagnifierDriver {
  start: () => void
  move: (p: Point) => void
  end: (p: Point) => string | null
}

export function useMagnifierDriver(): MagnifierDriver {
  const { getTargets, setLockedId, setRotaryActive, setGestureDirection } = useMagnifierInternal()
  const currentLockRef = useRef<string | null>(null)
  const currentFreeRef = useRef<string | null>(null)
  const recentSamplesRef = useRef<Point[]>([])
  // True while a rotary session is in progress (between start() and end()).
  // Used to make end() idempotent: the orb's React onPointerUp and the
  // window-level useLongPressRotarySession both call end() on the same
  // pointerup, and without this guard the second call would re-lock to the
  // nearest target via move(p) and double-fire onCommit.
  const sessionActiveRef = useRef(false)

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
    recentSamplesRef.current = []
    sessionActiveRef.current = true
    setLockedId(null)
    setRotaryActive(true)
    setGestureDirection('idle')
  }, [setLockedId, setRotaryActive, setGestureDirection])

  const move = useCallback(
    (p: Point) => {
      // Keep a tail of recent samples so direction can be classified from
      // the last ~5 moves rather than from the whole gesture.
      const samples = recentSamplesRef.current
      samples.push(p)
      if (samples.length > GESTURE_SAMPLE_WINDOW) {
        samples.splice(0, samples.length - GESTURE_SAMPLE_WINDOW)
      }
      setGestureDirection(computeGestureDirection(samples))

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
    [computeSnapGeometryMap, findFreeDriftAtPoint, setLockedId, setGestureDirection],
  )

  const end = useCallback(
    (p: Point): string | null => {
      // Idempotent: if the session already ended (e.g. via the orb's React
      // pointerup handler), do nothing for subsequent callers like the
      // window-level pointerup listener. Without this guard, move(p) below
      // would re-lock to the nearest target and double-fire onCommit.
      if (!sessionActiveRef.current) return null
      sessionActiveRef.current = false

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
      recentSamplesRef.current = []
      setLockedId(null)
      setRotaryActive(false)
      setGestureDirection('idle')
      return snapId ?? freeId
    },
    [move, getTargets, setLockedId, setRotaryActive, setGestureDirection],
  )

  useEffect(() => {
    return () => {
      setLockedId(null)
      setRotaryActive(false)
      setGestureDirection('idle')
    }
  }, [setLockedId, setRotaryActive, setGestureDirection])

  return { start, move, end }
}
