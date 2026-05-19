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

  const computeGeometryMap = useCallback((): Map<string, TargetGeometry> => {
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

  const start = useCallback(() => {
    currentLockRef.current = null
    setLockedId(null)
    setRotaryActive(true)
  }, [setLockedId, setRotaryActive])

  const move = useCallback((p: Point) => {
    const geom = computeGeometryMap()
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
  }, [computeGeometryMap, setLockedId])

  const end = useCallback((p: Point): string | null => {
    move(p)
    const lockId = currentLockRef.current
    if (lockId) {
      const target = getTargets().get(lockId)
      if (target) target.onCommit({ x: p.x, y: p.y })
    }
    currentLockRef.current = null
    setLockedId(null)
    setRotaryActive(false)
    return lockId
  }, [move, getTargets, setLockedId, setRotaryActive])

  useEffect(() => {
    return () => {
      setLockedId(null)
      setRotaryActive(false)
    }
  }, [setLockedId, setRotaryActive])

  return { start, move, end }
}
