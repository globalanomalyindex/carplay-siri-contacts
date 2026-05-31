import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useMagnifierDriver } from './useMagnifierDriver'
import { MagnifierSessionContext, type MagnifierSessionApi } from './MagnifierSessionContext'
import type { Point } from './geometry'

/**
 * Stable owner of a cell-initiated magnifier slide. A held cell hands off here
 * via `beginSlide`; this controller drives the lens to the lift and commits
 * whatever it lands on. It lives at the stage level and never unmounts during a
 * gesture, so a slide survives the origin cell being reflowed away when a tab
 * preview swaps the list out underneath it.
 */
export function MagnifierSessionProvider({ children }: { children: ReactNode }) {
  const driver = useMagnifierDriver()
  const slidingRef = useRef(false)

  const beginSlide = useCallback(
    (point: Point) => {
      slidingRef.current = true
      driver.start()
      driver.move(point)
    },
    [driver],
  )

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (slidingRef.current) driver.move({ x: e.clientX, y: e.clientY })
    }
    function onUp(e: PointerEvent) {
      if (!slidingRef.current) return
      slidingRef.current = false
      driver.end({ x: e.clientX, y: e.clientY })
    }
    function onCancel(e: PointerEvent) {
      // Ignore the implicit Motion-layout cancel at (0,0); the slide is meant
      // to survive a reflow. A genuine OS cancel carries real coordinates.
      if (e.clientX === 0 && e.clientY === 0) return
      if (!slidingRef.current) return
      slidingRef.current = false
      driver.end({ x: 0, y: 0 })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [driver])

  const value = useMemo<MagnifierSessionApi>(
    () => ({ beginSlide, isSliding: () => slidingRef.current }),
    [beginSlide],
  )

  return (
    <MagnifierSessionContext.Provider value={value}>
      {children}
    </MagnifierSessionContext.Provider>
  )
}
