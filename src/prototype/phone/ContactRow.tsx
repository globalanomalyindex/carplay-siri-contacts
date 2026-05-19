import { useCallback, useRef, useState } from 'react'
import { MagnifiableFrame } from '../Magnifier'
import { space } from '../../tokens/spatial'

/** Render variant of the ContactRow. Used by Figma Code Connect. */
export type ContactRowVariant = 'contact-row'
/** Interactive state of the ContactRow. */
export type ContactRowState = 'idle' | 'call-revealed' | 'text-revealed'

export interface ContactRowProps {
  id: string
  name: string
  avatar: string
  onCall: () => void
  onText: () => void
  index?: number
}

export function ContactRow({ id, name, avatar, onCall, onText, index = 0 }: ContactRowProps) {
  const downRef = useRef<{ x: number; y: number } | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downRef.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
    const el = e.currentTarget as HTMLElement
    if (typeof el.setPointerCapture === 'function') {
      try { el.setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const start = downRef.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dy) > Math.abs(dx)) return
    const clamped = Math.max(-120, Math.min(120, dx))
    setSwipeOffset(clamped)
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const start = downRef.current
    downRef.current = null
    setDragging(false)
    setSwipeOffset(0)
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dy) > Math.abs(dx)) return
    if (dx >= space.thresholdSwipeRowPx) {
      onCall()
    } else if (dx <= -space.thresholdSwipeRowPx) {
      onText()
    }
  }, [onCall, onText])

  const callRevealed = swipeOffset > 0
  const textRevealed = swipeOffset < 0

  return (
    <MagnifiableFrame
      id={`contact-row-${id}`}
      index={index}
      onCommit={onCall}
      label={`Call ${name}`}
    >
      <div
        data-testid={`contact-row-${id}`}
        data-variant="contact-row"
        data-state={callRevealed ? 'call-revealed' : textRevealed ? 'text-revealed' : 'idle'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          downRef.current = null
          setDragging(false)
          setSwipeOffset(0)
        }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 44,
          padding: '8px 12px',
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          borderRadius: 8,
          touchAction: 'pan-y',
          cursor: 'pointer',
          transform: `translateX(${swipeOffset}px)`,
          // Custom Apple-feel ease curve when not dragging. Snaps back fast
          // with a touch of overshoot resistance via the bezier shape.
          transition: dragging
            ? 'none'
            : 'transform 0.28s cubic-bezier(0.2, 0.85, 0.3, 1)',
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {callRevealed && (
          <div style={{
            position: 'absolute', left: -60, top: 0, bottom: 0,
            width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--action-call)', fontWeight: 600, fontSize: 16,
          }}>C</div>
        )}
        {textRevealed && (
          <div style={{
            position: 'absolute', right: -60, top: 0, bottom: 0,
            width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--action-text)', fontWeight: 600, fontSize: 16,
          }}>T</div>
        )}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7fa3c4, #b8a3c4)',
          fontSize: 11, fontWeight: 600, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
        }}>{avatar}</div>
        <span style={{ fontWeight: 500 }}>{name}</span>
      </div>
    </MagnifiableFrame>
  )
}
