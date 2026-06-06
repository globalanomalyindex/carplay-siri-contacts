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
  // Press feedback: the orb scales down the instant it is touched so a tap
  // feels heard before Siri's aura has a chance to bloom. Cleared the moment a
  // drag is recognised (the orb dissipates then) or the pointer lifts.
  const [pressed, setPressed] = useState(false)

  const previousStateRef = useRef<'idle' | 'siriActive' | 'rotary'>('idle')
  const state = snapshot.value as 'idle' | 'siriActive' | 'rotary'
  // Mirror the machine state into a ref so the window-level pointer listeners
  // (registered once) always read the current value without re-subscribing.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

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

  // --- Gesture resolvers -----------------------------------------------------
  // The drag is driven from window-level listeners (below) as the load-bearing
  // path, with the orb's own React handlers as the in-element mirror. Both call
  // these resolvers, which are idempotent: the first to consume downStartRef
  // wins, so a finalise from either path fires exactly once. This is what lets
  // a drag survive a list reflow mid-gesture, where pointer capture is broken
  // by Motion's layout animation and the lift lands off the orb.

  const resolveMove = useCallback(
    (x: number, y: number) => {
      const start = downStartRef.current
      if (!start) return
      lastPointerRef.current = { x, y }

      if (!draggingRef.current) {
        const dist = Math.hypot(x - start.x, y - start.y)
        if (dist >= space.thresholdDragDistPx && stateRef.current === 'idle') {
          draggingRef.current = true
          const el = hitRef.current
          if (el) {
            const r = el.getBoundingClientRect()
            setDissipateCenter({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
          }
          send({ type: 'DRAG_START' })
          driver.start()
          setPressed(false)
        }
      }

      if (draggingRef.current) driver.move({ x, y })
    },
    [send, driver],
  )

  const resolveUp = useCallback(
    (x: number, y: number) => {
      const start = downStartRef.current
      downStartRef.current = null
      setPressed(false)
      if (!start) return
      lastPointerRef.current = { x, y }

      if (draggingRef.current) {
        draggingRef.current = false
        setDissipateCenter(null)
        const lockedId = driver.end({ x, y })
        send(lockedId ? { type: 'COMMIT', targetId: lockedId } : { type: 'ABORT' })
        return
      }

      const dx = x - start.x
      const dy = y - start.y
      const dt = performance.now() - start.t
      const dist = Math.hypot(dx, dy)

      if (dy >= space.thresholdSwipeCancelPx && dy > Math.abs(dx)) {
        send({ type: 'SWIPE_DOWN' })
        return
      }
      if (dt <= space.thresholdTapTimeMs && dist < space.thresholdDragDistPx) {
        send({ type: 'TAP' })
      }
    },
    [send, driver],
  )

  const resolveCancel = useCallback(
    (x: number, y: number) => {
      // Motion's layout animation fires an implicit pointercancel at (0,0) on
      // the captured orb whenever sibling bounds animate (a list reflow, a tab
      // swap). The pointer has NOT actually lifted, so ignore it and let the
      // window listeners carry the drag to its real lift. A genuine OS cancel
      // carries real coordinates and does abort.
      if (x === 0 && y === 0) return
      const start = downStartRef.current
      if (!start) return
      downStartRef.current = null
      setPressed(false)
      if (draggingRef.current) {
        draggingRef.current = false
        setDissipateCenter(null)
        driver.end({ x: 0, y: 0 })
        send({ type: 'ABORT' })
      }
    },
    [send, driver],
  )

  // External abort (e.g. flicking off the screen edge). Tear the drag down
  // locally so a later lift cannot re-finalise it.
  const cancelDrag = useCallback(() => {
    if (!downStartRef.current && !draggingRef.current) return
    downStartRef.current = null
    setPressed(false)
    draggingRef.current = false
    setDissipateCenter(null)
    driver.end({ x: 0, y: 0 })
    send({ type: 'ABORT' })
  }, [send, driver])

  useEffect(() => {
    if (!orbControl) return
    orbControl._register({
      isSiriActive: () => stateRef.current === 'siriActive',
      isRotaryActive: () => stateRef.current === 'rotary',
      dismissSiri: () => send({ type: 'SWIPE_DOWN' }),
      abortRotary: cancelDrag,
    })
  }, [orbControl, send, cancelDrag])

  // Window-level listeners: the load-bearing path. They keep driving the drag
  // after pointer capture is lost to a layout reflow, and they deliver the lift
  // wherever it actually happens (which, after a reflow, is off the orb).
  useEffect(() => {
    const onMove = (e: PointerEvent) => resolveMove(e.clientX, e.clientY)
    const onUp = (e: PointerEvent) => resolveUp(e.clientX, e.clientY)
    const onCancel = (e: PointerEvent) => resolveCancel(e.clientX, e.clientY)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [resolveMove, resolveUp, resolveCancel])

  // Keyboard path for the orb: Enter or Space wakes Siri, the same primary
  // action a quick tap fires. The drag-to-magnify gesture has its own Tab path
  // (each magnifiable control is focusable), so the orb key handler stays
  // scoped to its tap action and never tries to synthesize a drag.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        send({ type: 'TAP' })
      }
    },
    [send],
  )

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downStartRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    draggingRef.current = false
    setPressed(true)
    // Capture keeps the gesture on the orb for touch; if Motion's layout
    // breaks it mid-drag the window listeners take over (see resolveCancel).
    const el = e.currentTarget as HTMLElement
    if (typeof el.setPointerCapture === 'function') {
      try { el.setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    }
  }, [])

  const inRotary = state === 'rotary'
  const reforming = reform !== null

  return (
    <>
      <div
        data-testid="master-orb-hit"
        data-state={state}
        ref={hitRef}
        role="button"
        tabIndex={0}
        aria-label="Wake Siri"
        aria-pressed={state === 'siriActive'}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => resolveMove(e.clientX, e.clientY)}
        onPointerUp={(e) => resolveUp(e.clientX, e.clientY)}
        onPointerCancel={(e) => resolveCancel(e.clientX, e.clientY)}
        style={{ cursor: 'pointer', touchAction: 'none' }}
      >
        <LiquidGlassFrame bright={settings.highContrast}>
          <div style={{ position: 'relative' }}>
            <Aura active={state === 'siriActive'} size={space.orb} />
            {!inRotary && (
              <motion.div
                key={reforming ? 'reforming' : 'solid'}
                // Tight spring reform: 0.6 -> 1.0 scale, opacity 0 -> 1.
                // Targets ~180ms of perceived motion so the orb is back
                // before the user's eye looks for it. Stiff + low mass
                // so it lands fast without overshoot.
                initial={reforming ? { opacity: 0, scale: 0.6 } : false}
                animate={{ opacity: 1, scale: pressed ? 0.92 : 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                  mass: 0.4,
                }}
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
