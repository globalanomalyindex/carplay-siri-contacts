import { useCallback, useMemo, useRef, useState } from 'react'
import { MagnifiableFrame } from '../Magnifier'
import { useMagnifierContext } from '../Magnifier/MagnifierContext'
import { ExpandableCell, type CellAction } from '../Magnifier/ExpandableCell'
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

/**
 * A contact row in the Phone app. Three input paths:
 *
 *   - Tap: fires `onCall` (the primary action of the row).
 *   - Swipe right: also fires `onCall`, with a green indicator slide.
 *   - Swipe left: fires `onText`, with a blue indicator slide.
 *   - Sustained hold (>= 250ms, < 8pt motion): expands the row inline,
 *     surfacing Call / Text action chips. Drift to a chip and lift to fire.
 *
 * The hold path is owned by ExpandableCell. The two swipe paths are owned
 * locally. The two coexist because ExpandableCell cancels its own hold timer
 * as soon as the pointer moves past 8pt, handing the gesture back to the
 * row's swipe handlers.
 */
export function ContactRow({ id, name, avatar, onCall, onText, index = 0 }: ContactRowProps) {
  const downRef = useRef<{ x: number; y: number } | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const { rotaryActive } = useMagnifierContext()

  /**
   * Check the surrounding ExpandableCell's state. Once it has taken over the
   * gesture (state === 'expanded' or 'committing'), the swipe handler must
   * yield: the user is no longer panning the row sideways, they are picking
   * an action chip inside the expanded cell.
   */
  const isCellExpanded = useCallback((el: HTMLElement | null) => {
    if (!el) return false
    const cell = el.closest<HTMLElement>('[data-testid^="expandable-contact-row-"]')
    const s = cell?.getAttribute('data-state')
    return s === 'armed' || s === 'sliding' || s === 'expanded' || s === 'committing'
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downRef.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
    // Deliberately no setPointerCapture here: the outer ExpandableCell already
    // captures the pointer. Capturing twice causes pointermove events on the
    // outer cell to be delivered to the inner row, defeating the cell-scope.
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const start = downRef.current
    if (!start) return
    // Yield the gesture once a magnifier session is running (the held cell has
    // handed off to the lens) or the contextual menu is open. The swipe-pan
    // only owns quick horizontal drags before any hold is recognised.
    if (rotaryActive || isCellExpanded(e.currentTarget as HTMLElement)) {
      if (swipeOffset !== 0) setSwipeOffset(0)
      return
    }
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dy) > Math.abs(dx)) return
    const clamped = Math.max(-120, Math.min(120, dx))
    setSwipeOffset(clamped)
  }, [isCellExpanded, swipeOffset, rotaryActive])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const start = downRef.current
    downRef.current = null
    setDragging(false)
    setSwipeOffset(0)
    if (!start) return
    // Same guard on lift: a lift during a magnifier session or from an expanded
    // chip must not also fire the swipe action.
    if (rotaryActive || isCellExpanded(e.currentTarget as HTMLElement)) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dy) > Math.abs(dx)) return
    if (dx >= space.thresholdSwipeRowPx) {
      onCall()
    } else if (dx <= -space.thresholdSwipeRowPx) {
      onText()
    }
  }, [isCellExpanded, onCall, onText, rotaryActive])

  const callRevealed = swipeOffset > 0
  const textRevealed = swipeOffset < 0

  // Action chips revealed inline when the row is held.
  const actions = useMemo<CellAction[]>(
    () => [
      {
        id: 'call',
        label: 'Call',
        tone: 'call',
        variant: 'primary',
        onAction: onCall,
      },
      {
        id: 'text',
        label: 'Text',
        tone: 'text',
        variant: 'secondary',
        onAction: onText,
      },
    ],
    [onCall, onText],
  )

  return (
    <MagnifiableFrame
      id={`contact-row-${id}`}
      index={index}
      onCommit={onCall}
      label={`Call ${name}`}
    >
      <ExpandableCell
        id={`contact-row-${id}`}
        variant="row"
        expansionAxis="vertical"
        actions={actions}
        onTap={onCall}
        label={`Contact ${name}`}
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
              : 'transform 0.2s cubic-bezier(0.2, 0.85, 0.3, 1)',
            background: 'rgba(255,255,255,0.05)',
            flex: '1 1 auto',
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
      </ExpandableCell>
    </MagnifiableFrame>
  )
}
