import { useCallback, useRef } from 'react'
import { useMagnifierInternal } from './MagnifierContext'
import {
  pickMagnifierTargetDiagnostic,
  computeGestureDirection,
  type TargetGeometry,
  type Point,
} from './geometry'
import type { MagnifierRegion } from './types'
import { space } from '../../tokens/spatial'

/** Last N pointer samples used to classify gesture direction. */
const GESTURE_SAMPLE_WINDOW = 5

export interface MagnifierDriver {
  start: () => void
  move: (p: Point) => void
  end: (p: Point) => string | null
  /**
   * Toggle spatial region gating. Default true (the smart hit-test). The
   * tremor replay flips it off to drive the naive nearest-centre picker and
   * measure the mis-commit reduction gating buys. Live gestures never call it.
   */
  setRegionGating: (on: boolean) => void
}

export function useMagnifierDriver(): MagnifierDriver {
  const {
    getTargets,
    setLockedId,
    setRotaryActive,
    setGestureDirection,
    recordCommit,
    requestMenu,
    telemetry,
  } = useMagnifierInternal()
  const currentLockRef = useRef<string | null>(null)
  const currentFreeRef = useRef<string | null>(null)
  const recentSamplesRef = useRef<Point[]>([])
  // Region gating flag: true is the production hit-test. The replay sets it
  // false to benchmark the naive picker against the gated one.
  const regionGatingRef = useRef(true)
  // Per-session telemetry accumulators. Reset in start().
  const sessionStartMsRef = useRef(0)
  const pathLengthRef = useRef(0)
  const lockChangesRef = useRef(0)
  const regionSwitchesRef = useRef(0)
  const lastSampleRef = useRef<Point | null>(null)
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
      // A dwell hands off to the menu rather than committing the lock. Record
      // the dwell as the session's outcome and close it: there is no lift
      // commit to wait for.
      telemetry?.record({ kind: 'dwellFire', at: Date.now(), targetId: id })
      telemetry?.endSession()
      requestMenu(id, p)
      currentLockRef.current = null
      currentFreeRef.current = null
      recentSamplesRef.current = []
      setLockedId(null)
      setRotaryActive(false)
      setGestureDirection('idle')
    },
    [clearDwell, requestMenu, setLockedId, setRotaryActive, setGestureDirection, telemetry],
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
    sessionStartMsRef.current = Date.now()
    pathLengthRef.current = 0
    lockChangesRef.current = 0
    regionSwitchesRef.current = 0
    lastSampleRef.current = null
    clearDwell()
    telemetry?.startSession(sessionStartMsRef.current)
    setLockedId(null)
    setRotaryActive(true)
    setGestureDirection('idle')
  }, [clearDwell, setLockedId, setRotaryActive, setGestureDirection, telemetry])

  const move = useCallback(
    (p: Point) => {
      // After a dwell hands the gesture to a menu the driver goes inert: a
      // trailing move from the orb or session controller must not re-lock.
      if (dwellSuspendRef.current) return
      lastPointRef.current = p

      // Effort: sum the distance between consecutive samples (the path length).
      const prev = lastSampleRef.current
      if (prev) pathLengthRef.current += Math.hypot(p.x - prev.x, p.y - prev.y)
      lastSampleRef.current = p

      // Keep a tail of recent samples so direction can be classified from
      // the last ~5 moves rather than from the whole gesture.
      const samples = recentSamplesRef.current
      samples.push(p)
      if (samples.length > GESTURE_SAMPLE_WINDOW) {
        samples.splice(0, samples.length - GESTURE_SAMPLE_WINDOW)
      }
      setGestureDirection(computeGestureDirection(samples))

      const geom = computeSnapGeometryMap()
      const fromId = currentLockRef.current
      const pick = pickMagnifierTargetDiagnostic(
        p,
        geom,
        fromId,
        space.membraneHysteresisFraction,
        regionGatingRef.current,
      )
      const lockId = pick.lockId
      // The cell-membrane stickiness fired: the hold kept the lock that a naive
      // nearest-centre pass would have abandoned. Record it as a save.
      if (pick.membraneHeld && fromId) {
        telemetry?.record({
          kind: 'membraneSave',
          at: Date.now(),
          heldId: fromId,
          wouldBeId: pick.naivePick,
        })
      }
      if (lockId !== fromId) {
        const fromRegion = regionOf(geom, fromId)
        const toRegion = regionOf(geom, lockId)
        const crossedRegion = lockId !== null && fromId !== null && fromRegion !== toRegion
        lockChangesRef.current += 1
        if (crossedRegion) regionSwitchesRef.current += 1
        telemetry?.record({
          kind: 'lockChange',
          at: Date.now(),
          from: fromId,
          to: lockId,
          crossedRegion,
        })
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
    [computeSnapGeometryMap, findFreeDriftAtPoint, getTargets, setLockedId, setGestureDirection, clearDwell, fireDwell, telemetry],
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
      let committedTarget = null
      if (snapId) {
        const target = getTargets().get(snapId)
        if (target) target.onCommit({ x: p.x, y: p.y })
        committedTarget = target ?? null
      } else if (freeId) {
        const target = getTargets().get(freeId)
        if (target) target.onCommit({ x: p.x, y: p.y })
        committedTarget = target ?? null
      }
      if (committedId) recordCommit(committedId)
      // The lift is the session's outcome. A quickdraw target that the lens
      // ends on commits live in move(), so flag the kind accordingly; anything
      // else commits on this deliberate lift.
      if (committedId) {
        telemetry?.record({
          kind: 'commit',
          at: Date.now(),
          targetId: committedId,
          durationMs: Math.max(0, Date.now() - sessionStartMsRef.current),
          pathLengthPx: pathLengthRef.current,
          lockChanges: lockChangesRef.current,
          regionSwitches: regionSwitchesRef.current,
          commitKind: committedTarget?.quickdraw ? 'quickdraw' : 'lift',
        })
      }
      telemetry?.endSession()
      // Cancel any dwell, including one the move(p) above may have armed when it
      // settled the final lock; the lift commits now, there is no rest to wait.
      clearDwell()
      currentLockRef.current = null
      currentFreeRef.current = null
      recentSamplesRef.current = []
      lastSampleRef.current = null
      setLockedId(null)
      setRotaryActive(false)
      setGestureDirection('idle')
      return committedId
    },
    [move, getTargets, setLockedId, setRotaryActive, setGestureDirection, recordCommit, clearDwell, telemetry],
  )

  const setRegionGating = useCallback((on: boolean) => {
    regionGatingRef.current = on
  }, [])

  return { start, move, end, setRegionGating }
}

/** Region of `id` within a geometry map, or null when absent. */
function regionOf(
  geom: Map<string, TargetGeometry>,
  id: string | null,
): MagnifierRegion | null {
  if (!id) return null
  const t = geom.get(id)
  return t ? (t.region ?? 'content') : null
}
