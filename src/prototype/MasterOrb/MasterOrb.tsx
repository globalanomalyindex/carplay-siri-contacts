import { useCallback, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import { orbMachine } from './orbMachine'
import { Orb } from './Orb'
import { Aura } from './Aura'
import { Dissipation } from './Dissipation'
import { LiquidGlassFrame } from '../chrome/LiquidGlassFrame'
import { useMagnifierDriver } from '../Magnifier/useMagnifierDriver'
import { useSettings } from '../../a11y/SettingsContext'
import { space } from '../../tokens/spatial'

export function MasterOrb() {
  const [snapshot, send] = useMachine(orbMachine)
  const driver = useMagnifierDriver()
  const settings = useSettings()

  const downStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const draggingRef = useRef(false)
  const [dissipateCenter, setDissipateCenter] = useState<{ x: number; y: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downStartRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    draggingRef.current = false
    const el = e.currentTarget as HTMLElement
    if (typeof el.setPointerCapture === 'function') {
      try { el.setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const start = downStartRef.current
    if (!start) return

    if (!draggingRef.current) {
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y)
      if (dist >= space.thresholdDragDistPx && snapshot.value === 'idle') {
        draggingRef.current = true
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setDissipateCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
        send({ type: 'DRAG_START' })
        driver.start()
      }
    }

    if (draggingRef.current) {
      driver.move({ x: e.clientX, y: e.clientY })
    }
  }, [send, snapshot.value, driver])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const start = downStartRef.current
    downStartRef.current = null
    if (!start) return

    if (draggingRef.current) {
      draggingRef.current = false
      setDissipateCenter(null)
      const lockedId = driver.end({ x: e.clientX, y: e.clientY })
      if (lockedId) {
        send({ type: 'COMMIT', targetId: lockedId })
      } else {
        send({ type: 'ABORT' })
      }
      return
    }

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const dt = performance.now() - start.t
    const dist = Math.hypot(dx, dy)

    if (dy >= space.thresholdSwipeCancelPx && dy > Math.abs(dx)) {
      send({ type: 'SWIPE_DOWN' })
      return
    }

    if (dt <= space.thresholdTapTimeMs && dist < space.thresholdDragDistPx) {
      send({ type: 'TAP' })
      return
    }
  }, [send, driver])

  const state = snapshot.value as 'idle' | 'siriActive' | 'rotary'
  const inRotary = state === 'rotary'

  return (
    <>
      <div
        data-testid="master-orb-hit"
        data-state={state}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          if (draggingRef.current) {
            draggingRef.current = false
            driver.end({ x: 0, y: 0 })
          }
          downStartRef.current = null
          setDissipateCenter(null)
          if (snapshot.value === 'rotary') send({ type: 'ABORT' })
        }}
        style={{ cursor: 'pointer', touchAction: 'none' }}
      >
        <LiquidGlassFrame bright={settings.highContrast}>
          <div style={{ position: 'relative' }}>
            <Aura active={state === 'siriActive'} size={space.orb} />
            {!inRotary && <Orb breath={state === 'idle'} />}
          </div>
        </LiquidGlassFrame>
      </div>
      <Dissipation
        active={inRotary && dissipateCenter !== null}
        center={dissipateCenter ?? { x: 0, y: 0 }}
      />
    </>
  )
}
