import { useEffect, useRef } from 'react'
import { useMagnifierDriver } from './useMagnifierDriver'
import { useMagnifierContext } from './MagnifierContext'

/**
 * Once long-press has fired and rotary mode has begun, this hook listens
 * for pointer move/up at the window level and forwards them to the magnifier
 * driver, so the rest of the gesture (drift, lift) behaves like the orb-drag
 * path.
 */
export function useLongPressRotarySession() {
  const driver = useMagnifierDriver()
  const { rotaryActive } = useMagnifierContext()
  const activeRef = useRef(false)

  useEffect(() => {
    activeRef.current = rotaryActive
    if (!rotaryActive) return

    function onMove(e: PointerEvent) {
      if (!activeRef.current) return
      driver.move({ x: e.clientX, y: e.clientY })
    }
    function onUp(e: PointerEvent) {
      if (!activeRef.current) return
      driver.end({ x: e.clientX, y: e.clientY })
    }
    function onCancel() {
      if (!activeRef.current) return
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
  }, [rotaryActive, driver])
}
