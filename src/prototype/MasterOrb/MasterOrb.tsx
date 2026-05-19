import { useCallback, useRef } from 'react'
import { useMachine } from '@xstate/react'
import { orbMachine } from './orbMachine'
import { Orb } from './Orb'
import { Aura } from './Aura'
import { LiquidGlassFrame } from '../chrome/LiquidGlassFrame'
import { space } from '../../tokens/spatial'

/**
 * The MasterOrb: state machine + Orb visual + Aura + LiquidGlassFrame.
 * Handles tap and swipe-down on its own hit area. Drag handling (rotary
 * entry) is added in a later task. Long-press-anywhere is wired separately
 * via the system-level recognizer in Phase 6.
 */
export function MasterOrb() {
  const [snapshot, send] = useMachine(orbMachine)
  const downStartRef = useRef<{ x: number; y: number; t: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downStartRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    const el = e.currentTarget as HTMLElement
    // jsdom does not implement setPointerCapture; guard the call so tests pass.
    if (typeof el.setPointerCapture === 'function') {
      el.setPointerCapture(e.pointerId)
    }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const start = downStartRef.current
    downStartRef.current = null
    if (!start) return

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
  }, [send])

  const state = snapshot.value as 'idle' | 'siriActive' | 'rotary'

  return (
    <div
      data-testid="master-orb-hit"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { downStartRef.current = null }}
      style={{
        cursor: 'pointer',
        touchAction: 'none',
      }}
    >
      <LiquidGlassFrame>
        <div style={{ position: 'relative' }}>
          <Aura active={state === 'siriActive'} size={space.orb} />
          {state !== 'rotary' && (
            <Orb breath={state === 'idle'} />
          )}
        </div>
      </LiquidGlassFrame>
    </div>
  )
}
