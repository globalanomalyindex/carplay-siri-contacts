import { useEffect, type RefObject } from 'react'
import { useOrbControl } from './OrbControlContext'

export interface UseSwipeOffScreenAbortOpts {
  /** Ref to the CarPlay screen element whose bounding rect is the "safe area". */
  screenRef: RefObject<HTMLElement | null>
}

/**
 * While rotary mode is active, if the pointer leaves the CarPlay screen's
 * bounding rect, abort rotary. Matches the user's mental model: flicking off
 * the screen cancels the gesture and returns to normal state.
 *
 * Implementation note: we listen for pointermove at the window level (so we
 * see movement even when the cursor is outside the screen element), and
 * compare against the screen's getBoundingClientRect.
 */
export function useSwipeOffScreenAbort({ screenRef }: UseSwipeOffScreenAbortOpts) {
  const { rotaryActive, abortRotary } = useOrbControl()

  useEffect(() => {
    if (!rotaryActive) return
    const screen = screenRef.current
    if (!screen) return

    function isOutside(x: number, y: number): boolean {
      const r = (screen as HTMLElement).getBoundingClientRect()
      return x < r.left || x > r.right || y < r.top || y > r.bottom
    }

    function onMove(e: PointerEvent) {
      if (isOutside(e.clientX, e.clientY)) {
        abortRotary()
      }
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [rotaryActive, abortRotary, screenRef])
}
