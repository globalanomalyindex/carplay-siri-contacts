import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useMachine } from '@xstate/react'
import { orbMachine } from './orbMachine'
import { Orb } from './Orb'
import { Aura } from './Aura'
import { Dissipation } from './Dissipation'
import { Coalesce } from './Coalesce'
import { LiquidGlassFrame } from '../chrome/LiquidGlassFrame'
import { useMagnifierDriver } from '../Magnifier/useMagnifierDriver'
import { useSettings } from '../../a11y/SettingsContext'
import { OrbControlContext } from './OrbControlContext'
import { dur, easing } from '../../tokens/motion'
import { space } from '../../tokens/spatial'

export function MasterOrb() {
  const [snapshot, send] = useMachine(orbMachine)
  const driver = useMagnifierDriver()
  const settings = useSettings()
  const orbControl = useContext(OrbControlContext)

  const hitRef = useRef<HTMLDivElement>(null)
  const downStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const draggingRef = useRef(false)
  const [dissipateCenter, setDissipateCenter] = useState<{ x: number; y: number } | null>(null)
  const [reform, setReform] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null)

  const previousStateRef = useRef<'idle' | 'siriActive' | 'rotary'>('idle')
  const state = snapshot.value as 'idle' | 'siriActive' | 'rotary'

  // Publish state up to the shell so global hooks (tap-to-dismiss-Siri,
  // swipe-to-edge cancel) can react. The shell provider sets up _publish
  // and _register; in tests without the provider, both are absent and we
  // simply skip the side effect.
  useEffect(() => {
    orbControl?._publish({
      siriActive: state === 'siriActive',
      rotaryActive: state === 'rotary',
    })
  }, [orbControl, state])

  useEffect(() => {
    if (!orbControl) return
    orbControl._register({
      isSiriActive: () => state === 'siriActive',
      isRotaryActive: () => state === 'rotary',
      dismissSiri: () => send({ type: 'SWIPE_DOWN' }),
      abortRotary: () => send({ type: 'ABORT' }),
    })
  }, [orbControl, send, state])

  // Detect rotary -> idle transition. When that fires and the user did not
  // commit on a target (driver clears lockedId before exit), play the reform
  // particle sweep back to the orb's home center.
  useEffect(() => {
    const prev = previousStateRef.current
    previousStateRef.current = state
    if (prev === 'rotary' && state === 'idle') {
      const last = lastPointerRef.current
      const el = hitRef.current
      if (last && el) {
        const r = el.getBoundingClientRect()
        setReform({
          from: { x: last.x, y: last.y },
          to: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
        })
      }
    }
  }, [state])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downStartRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    draggingRef.current = false
    const el = e.currentTarget as HTMLElement
    if (typeof el.setPointerCapture === 'function') {
      try { el.setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const start = downStartRef.current
    if (!start) return
    lastPointerRef.current = { x: e.clientX, y: e.clientY }

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
    lastPointerRef.current = { x: e.clientX, y: e.clientY }

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

  const inRotary = state === 'rotary'
  const reforming = reform !== null

  return (
    <>
      <div
        data-testid="master-orb-hit"
        data-state={state}
        ref={hitRef}
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
            {!inRotary && (
              <motion.div
                key={reforming ? 'reforming' : 'solid'}
                initial={reforming ? { opacity: 0, scale: 0.4 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: dur.reform, ease: easing.liquidIn }}
                style={{ display: 'flex' }}
              >
                <Orb breath={state === 'idle' && !reforming} />
              </motion.div>
            )}
          </div>
        </LiquidGlassFrame>
      </div>
      <Dissipation
        active={inRotary && dissipateCenter !== null}
        center={dissipateCenter ?? { x: 0, y: 0 }}
      />
      <Coalesce
        active={reform !== null}
        from={reform?.from ?? { x: 0, y: 0 }}
        to={reform?.to ?? { x: 0, y: 0 }}
        onComplete={() => setReform(null)}
      />
    </>
  )
}
