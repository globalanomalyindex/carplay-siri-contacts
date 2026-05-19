import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import type { QuickAction, QuickActionPosition } from './types'
import { pickQuickActionDirection } from './quickActionsGeometry'

/**
 * Layout variant. 'cardinal' arranges up to four chips at the cardinal
 * compass points around the anchor. Future variants might include 'fan'
 * or 'arc' for non-orthogonal layouts.
 */
export type QuickActionsVariant = 'cardinal' | 'compact'
/** Phase of the menu's lifetime. Mirrors data-state on the root. */
export type QuickActionsState = 'opening' | 'open' | 'committing' | 'dismissing'

export interface QuickActionsProps {
  /** Anchor point in viewport coordinates (the user's touch position). */
  anchor: { x: number; y: number }
  actions: QuickAction[]
  /**
   * Fires when the user lifts the pointer. The targeted action (the chip
   * the pointer was over at lift) fires its onAction; the menu then
   * dismisses. Callers should treat this as the close signal regardless
   * of whether anything committed.
   */
  onClose: () => void
  variant?: QuickActionsVariant
}

/**
 * Distance in px from the anchor center to each chip's center. Sized so a
 * small drift past the anchor lands cleanly on a chip without overlapping
 * the touch dot in the middle.
 */
const CHIP_RADIUS = 80
/** Chip square dimensions. */
const CHIP_SIZE = 64

const POSITION_OFFSETS: Record<QuickActionPosition, { dx: number; dy: number }> = {
  up:    { dx: 0,  dy: -1 },
  right: { dx: 1,  dy: 0 },
  down:  { dx: 0,  dy: 1 },
  left:  { dx: -1, dy: 0 },
}

/**
 * Contextual quick-action menu. Opens at the user's touch point when the
 * long-press fires on a cell that opts in via `quickActions`. The user
 * drags toward one cardinal direction; the matching chip highlights;
 * lift commits that action. Lifting in the deadzone dismisses.
 *
 * Rendered into a portal at document.body so the chips can extend past
 * the CarPlay screen frame without being clipped.
 */
export function QuickActions({
  anchor,
  actions,
  onClose,
  variant = 'cardinal',
}: QuickActionsProps) {
  const reduced = useReducedMotion()
  const [targetedDir, setTargetedDir] = useState<QuickActionPosition | null>(null)
  const [phase, setPhase] = useState<QuickActionsState>('opening')
  const closedRef = useRef(false)

  // Map position -> action for O(1) lookup when the pointer settles.
  const byPosition = useMemo(() => {
    const m = new Map<QuickActionPosition, QuickAction>()
    for (const a of actions) m.set(a.position, a)
    return m
  }, [actions])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const dir = pickQuickActionDirection(anchor, { x: e.clientX, y: e.clientY })
      // Ignore directions with no chip assigned (e.g. only up + down).
      setTargetedDir(dir && byPosition.has(dir) ? dir : null)
      if (phase === 'opening') setPhase('open')
    }
    function onUp(e: PointerEvent) {
      if (closedRef.current) return
      closedRef.current = true
      const dir = pickQuickActionDirection(anchor, { x: e.clientX, y: e.clientY })
      const action = dir ? byPosition.get(dir) : null
      if (action) {
        setPhase('committing')
        action.onAction()
      } else {
        setPhase('dismissing')
      }
      onClose()
    }
    function onCancel() {
      if (closedRef.current) return
      closedRef.current = true
      setPhase('dismissing')
      onClose()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [anchor, byPosition, onClose, phase])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      data-testid="quick-actions"
      data-variant={variant}
      data-state={phase}
      aria-label="Quick actions"
      role="menu"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
      }}
    >
      {/* Center anchor pulse: reminds the user where they touched. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.4 }}
        animate={
          reduced
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, scale: [0.4, 1.2, 1] }
        }
        transition={
          reduced
            ? { duration: 0.12 }
            : { type: 'spring', stiffness: 380, damping: 26 }
        }
        style={{
          position: 'absolute',
          left: anchor.x - 6,
          top: anchor.y - 6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--accent-cyan, rgba(120, 220, 240, 0.95))',
          boxShadow: '0 0 12px rgba(120, 220, 240, 0.7)',
        }}
      />
      {actions.map((action) => {
        const offset = POSITION_OFFSETS[action.position]
        const cx = anchor.x + offset.dx * CHIP_RADIUS
        const cy = anchor.y + offset.dy * CHIP_RADIUS
        const highlighted = targetedDir === action.position
        return (
          <QuickActionChip
            key={action.id}
            action={action}
            x={cx - CHIP_SIZE / 2}
            y={cy - CHIP_SIZE / 2}
            highlighted={highlighted}
            reduced={reduced}
          />
        )
      })}
    </div>,
    document.body,
  )
}

interface ChipProps {
  action: QuickAction
  x: number
  y: number
  highlighted: boolean
  reduced: boolean
}

function QuickActionChip({ action, x, y, highlighted, reduced }: ChipProps) {
  const base: CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    background: highlighted
      ? 'rgba(120, 220, 240, 0.28)'
      : 'rgba(255, 255, 255, 0.10)',
    border: highlighted
      ? '1.5px solid var(--accent-cyan, rgba(120, 220, 240, 0.85))'
      : '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: highlighted
      ? '0 0 24px rgba(120, 220, 240, 0.55), inset 0 1px 0 rgba(255,255,255,0.20)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 16px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  }
  return (
    <AnimatePresence>
      <motion.div
        key={action.id}
        data-testid={`quick-action-${action.id}`}
        data-state={highlighted ? 'highlighted' : 'idle'}
        data-position={action.position}
        role="menuitem"
        aria-label={action.label}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{
          opacity: 1,
          scale: highlighted ? 1.08 : 1,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={
          reduced
            ? { duration: 0.12 }
            : { type: 'spring', stiffness: 380, damping: 26 }
        }
        style={base}
      >
        <div style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>{action.icon}</div>
        <div style={{ lineHeight: 1 }}>{action.label}</div>
      </motion.div>
    </AnimatePresence>
  )
}
