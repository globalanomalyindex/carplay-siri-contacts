import { useCallback, useRef } from 'react'
import { useMagnifierInternal } from './MagnifierContext'
import {
  pickMagnifierTarget,
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
  const {
    getTargets,
    setLockedId,
    setRotaryActive,
    setGestureDirection,
    recordCommit,
    requestMenu,
  } = useMagnifierInternal()
  const currentLockRef = useRef<string | null>(null)
  const currentFreeRef = useRef<string | null>(null)
  const recentSamplesRef = useRef<Point[]>([])
  // True while a rotary session is in progress (between start() and end()).
  // Keeps end() idempotent: the orb finalises from both its React pointerup and
  // a window pointerup mirror, and without this guard the second call would
  // re-lock to the nearest target via move(p) and double-fire onCommit.
  const sessionActiveRef = useRef(false)
  // Dwell-to-menu: the lens resting on one target opens its contextual menu.
  // The timer is (re)started whenever the lock lands on a fresh non-quickdraw
  // target and cleared the moment the lock moves on, so it measures how long
  // the lens has rested in place. `lastPointRef` is the resting point handed to
  // the menu; `dwellSuspendRef` makes the driver inert after the menu takes
  // over so a trailing move/up cannot re-lock or commit.
  const dwellTimerRef = useRef<number | null>(null)
  const lastPointRef = useRef<Point | null>(null)
  const dwellSuspendRef = useRef(false)

  const clearDwell = useCallback(() => {
    if (dwellTimerRef.current !== null) {
      window.clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
  }, [])

  // The dwell fired: hand the still-held gesture to the locked target's menu
  // and tear down the magnifier visuals WITHOUT committing (the menu owns the
  // lift now, so it must not also fire the lock's onCommit).
  const fireDwell = useCallback(
    (id: string) => {
      if (!sessionActiveRef.current) return
      const p = lastPointRef.current ?? { x: 0, y: 0 }
      dwellSuspendRef.current = true
      sessionActiveRef.current = false
      clearDwell()
      requestMenu(id, p)
      currentLockRef.current = null
      currentFreeRef.current = null
      recentSamplesRef.current = []
      setLockedId(null)
      setRotaryActive(false)
      setGestureDirection('idle')
    },
    [clearDwell, requestMenu, setLockedId, setRotaryActive, setGestureDirection],
  )

  // Snap (discrete) targets only, used by pickLockedTarget.
  const computeSnapGeometryMap = useCallback((): Map<string, TargetGeometry> => {
    const out = new Map<string, TargetGeometry>()
    const targets = getTargets()
    for (const [id, t] of targets) {
      if (t.behavior !== 'snapToCenter') continue
      const el = t.ref.current
      if (!el) continue
      out.set(id, { rect: el.getBoundingClientRect(), region: t.region ?? 'content' })
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
    dwellSuspendRef.current = false
    lastPointRef.current = null
    clearDwell()
    setLockedId(null)
    setRotaryActive(true)
    setGestureDirection('idle')
  }, [clearDwell, setLockedId, setRotaryActive, setGestureDirection])

  const move = useCallback(
    (p: Point) => {
      // After a dwell hands the gesture to a menu the driver goes inert: a
      // trailing move from the orb or session controller must not re-lock.
      if (dwellSuspendRef.current) return
      lastPointRef.current = p

      // Keep a tail of recent samples so direction can be classified from
      // the last ~5 moves rather than from the whole gesture.
      const samples = recentSamplesRef.current
      samples.push(p)
      if (samples.length > GESTURE_SAMPLE_WINDOW) {
        samples.splice(0, samples.length - GESTURE_SAMPLE_WINDOW)
      }
      setGestureDirection(computeGestureDirection(samples))

      const geom = computeSnapGeometryMap()
      const lockId = pickMagnifierTarget(
        p,
        geom,
        currentLockRef.current,
        space.membraneHysteresisFraction,
      )
      if (lockId !== currentLockRef.current) {
        currentLockRef.current = lockId
        setLockedId(lockId)
        // The lens moved on: restart the dwell clock from this fresh target.
        clearDwell()
        if (lockId) {
          const locked = getTargets().get(lockId)
          if (locked?.quickdraw) {
            // Quickdraw targets (the dock) activate the instant the lens locks
            // on, so a drag across them switches surfaces live without a lift.
            // Only the live switch fires here; the flash still waits for end().
            locked.onCommit({ x: p.x, y: p.y })
          } else if (locked) {
            // Rest here long enough and the target's contextual menu opens, so
            // one uninterrupted hold can hover a contact and reach its actions.
            dwellTimerRef.current = window.setTimeout(
              () => fireDwell(lockId),
              space.dwellMenuMs,
            )
          }
        }
      }
      // Only track freeDrift target while not snap-locked.
      currentFreeRef.current = lockId ? null : findFreeDriftAtPoint(p)
    },
    [computeSnapGeometryMap, findFreeDriftAtPoint, getTargets, setLockedId, setGestureDirection, clearDwell, fireDwell],
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
      const committedId = snapId ?? freeId
      if (snapId) {
        const target = getTargets().get(snapId)
        if (target) target.onCommit({ x: p.x, y: p.y })
      } else if (freeId) {
        const target = getTargets().get(freeId)
        if (target) target.onCommit({ x: p.x, y: p.y })
      }
      if (committedId) recordCommit(committedId)
      // Cancel any dwell, including one the move(p) above may have armed when it
      // settled the final lock; the lift commits now, there is no rest to wait.
      clearDwell()
      currentLockRef.current = null
      currentFreeRef.current = null
      recentSamplesRef.current = []
      setLockedId(null)
      setRotaryActive(false)
      setGestureDirection('idle')
      return committedId
    },
    [move, getTargets, setLockedId, setRotaryActive, setGestureDirection, recordCommit, clearDwell],
  )

  return { start, move, end }
}
