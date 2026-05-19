import { useEffect, useRef } from 'react'
import { space } from '../../tokens/spatial'

export interface UseLongPressAnywhereOpts {
  enabled: boolean
  onLongPress: (p: { x: number; y: number }) => void
}

/**
 * Registers a window-level pointer listener that fires `onLongPress` when
 * the user holds a touch in (mostly) the same place for at least 250ms.
 * Designed as a tap-rescue: tap (short touch + release) reaches apps as
 * normal; sustained holds enter rotary mode.
 */
export function useLongPressAnywhere({ enabled, onLongPress }: UseLongPressAnywhereOpts) {
  const startRef = useRef<{ x: number; y: number; timer: number } | null>(null)

  useEffect(() => {
    if (!enabled) return

    function clearPending() {
      if (startRef.current) {
        window.clearTimeout(startRef.current.timer)
        startRef.current = null
      }
    }

    function onDown(e: PointerEvent) {
      clearPending()
      const x = e.clientX
      const y = e.clientY
      const timer = window.setTimeout(() => {
        onLongPress({ x, y })
        startRef.current = null
      }, space.thresholdTapTimeMs)
      startRef.current = { x, y, timer }
    }

    function onMove(e: PointerEvent) {
      const s = startRef.current
      if (!s) return
      const dist = Math.hypot(e.clientX - s.x, e.clientY - s.y)
      if (dist >= space.thresholdDragDistPx) {
        clearPending()
      }
    }

    function onUp() {
      clearPending()
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      clearPending()
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [enabled, onLongPress])
}
