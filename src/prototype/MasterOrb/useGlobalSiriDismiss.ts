import { useEffect } from 'react'
import { useOrbControl } from './OrbControlContext'

/**
 * While Siri is active, any pointerdown anywhere on the document dismisses it.
 * Taps on the orb itself fall through to the orb's own handler (which already
 * sends TAP -> idle), so we just skip pointerdowns whose target is inside the
 * orb hit area. The orb's TAP toggle still wins because we listen at the
 * capture phase only when Siri is active.
 */
export function useGlobalSiriDismiss() {
  const { siriActive, dismissSiri } = useOrbControl()

  useEffect(() => {
    if (!siriActive) return

    function isInsideOrb(target: EventTarget | null): boolean {
      if (!(target instanceof Element)) return false
      return Boolean(target.closest('[data-testid="master-orb-hit"]'))
    }

    function onDown(e: PointerEvent) {
      if (isInsideOrb(e.target)) return
      dismissSiri()
    }

    // Listen on window, but defer to the orb's own handler if the tap lands
    // on the orb. Mouse and touch both surface as pointerdown in modern
    // browsers (and jsdom).
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [siriActive, dismissSiri])
}
