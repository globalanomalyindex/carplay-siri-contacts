import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import { space } from '../../tokens/spatial'

/** Visual emphasis for an action chip. */
export type CellActionVariant = 'primary' | 'secondary'

/** Color hint for an action chip. Defaults: primary maps to call/cyan, secondary to neutral. */
export type CellActionTone = 'call' | 'text' | 'favorite' | 'info' | 'neutral'

export interface CellAction {
  id: string
  label: string
  icon?: ReactNode
  onAction: () => void
  variant?: CellActionVariant
  tone?: CellActionTone
}

/** Render variant of an ExpandableCell. Captured on the root for Figma export. */
export type ExpandableCellVariant = 'row' | 'dock' | 'card'
/** Lifecycle phase of an ExpandableCell. */
export type ExpandableCellState =
  | 'collapsed'
  | 'pressing'
  | 'expanded'
  | 'committing'

export interface ExpandableCellProps {
  id: string
  /**
   * Direction the cell grows when expanded.
   * 'horizontal' pushes action chips out to the right of the cell content.
   * 'vertical' arranges action chips below the cell content (good for narrow rows).
   */
  expansionAxis: 'horizontal' | 'vertical'
  /** Render variant for design-system export. Defaults to 'row'. */
  variant?: ExpandableCellVariant
  /** Actions revealed inline when expanded. */
  actions: CellAction[]
  /** When set, a quick tap (no hold) fires this. The primary action of the cell. */
  onTap?: () => void
  /** Cell content rendered both in collapsed and expanded states. */
  children: ReactNode
  /** aria-label for the cell as a whole. */
  label?: string
  /**
   * Outer className passthrough. Use sparingly; the cell owns its layout when
   * expanded.
   */
  className?: string
}

/**
 * Hold duration to enter expansion. Matches the orb's long-press threshold.
 */
const HOLD_MS = space.thresholdTapTimeMs
/**
 * Tap-vs-drag threshold. Reused from the spatial tokens.
 */
const DRAG_THRESHOLD = space.thresholdDragDistPx
/**
 * Grace window after the hold timer fires. A lift within this slack still
 * counts as a tap (the cell collapses without firing) so the user can change
 * their mind without committing the wrong action.
 */
const HOLD_TAP_GRACE_MS = 50

interface PressState {
  pointerId: number
  startX: number
  startY: number
  startTime: number
  /** Set when the hold timer fires. */
  expandedAt: number | null
}

/**
 * Inline expand-in-place pattern. On a sustained hold (>= 250ms, < 8pt motion)
 * the cell expands along its `expansionAxis`, revealing action chips. Drift
 * over a chip highlights it; lift on a chip fires its action. Lift elsewhere
 * collapses without firing. Tap (short press, < 8pt motion) fires `onTap`.
 *
 * Neighbor reflow: wrap the parent list of cells in a
 * `<motion.div layout>` (or pass `layout` to its existing motion wrapper) so
 * adjacent cells animate as one cell expands.
 *
 * Performance: the expanded cell uses Motion's `layout` prop, so the box
 * grows via FLIP rather than a width/height keyframe. Action chips fade and
 * slide via opacity + transform, both compositor-friendly.
 */
export function ExpandableCell({
  id,
  expansionAxis,
  variant = 'row',
  actions,
  onTap,
  children,
  label,
  className,
}: ExpandableCellProps) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const pressRef = useRef<PressState | null>(null)
  const holdTimerRef = useRef<number | null>(null)
  const [state, setState] = useState<ExpandableCellState>('collapsed')
  const [hoveredActionId, setHoveredActionId] = useState<string | null>(null)

  const cancelHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const collapse = useCallback(() => {
    cancelHoldTimer()
    pressRef.current = null
    setState('collapsed')
    setHoveredActionId(null)
  }, [cancelHoldTimer])

  /**
   * Find the action chip whose bounding rect contains the point.
   * Falls back to the nearest chip by center-distance when nothing
   * is directly under the pointer (so a small overshoot still
   * highlights the obvious target).
   */
  const findActionAtPoint = useCallback(
    (point: { x: number; y: number }): string | null => {
      const root = rootRef.current
      if (!root) return null
      const chips = root.querySelectorAll<HTMLElement>('[data-expandable-chip="true"]')
      let inside: string | null = null
      let nearest: { id: string; dist: number } | null = null
      chips.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (
          point.x >= r.left &&
          point.x <= r.right &&
          point.y >= r.top &&
          point.y <= r.bottom
        ) {
          inside = el.dataset.actionId ?? null
        }
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.hypot(point.x - cx, point.y - cy)
        if (!nearest || d < nearest.dist) {
          nearest = { id: el.dataset.actionId ?? '', dist: d }
        }
      })
      if (inside) return inside
      // Only fall back to nearest if the pointer is reasonably close to the
      // expanded cluster (within 28pt of a chip center).
      if (nearest !== null) {
        const n = nearest as { id: string; dist: number }
        if (n.dist <= 28) return n.id
      }
      return null
    },
    [],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only honor a single primary pointer at a time.
      if (pressRef.current) return
      pressRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTime: performance.now(),
        expandedAt: null,
      }
      setState('pressing')

      const el = e.currentTarget as HTMLElement
      if (typeof el.setPointerCapture === 'function') {
        try { el.setPointerCapture(e.pointerId) } catch { /* jsdom */ }
      }

      cancelHoldTimer()
      holdTimerRef.current = window.setTimeout(() => {
        const press = pressRef.current
        if (!press || press.pointerId !== e.pointerId) return
        press.expandedAt = performance.now()
        setState('expanded')
      }, HOLD_MS)
    },
    [cancelHoldTimer],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const press = pressRef.current
      if (!press || press.pointerId !== e.pointerId) return

      const dx = e.clientX - press.startX
      const dy = e.clientY - press.startY
      const dist = Math.hypot(dx, dy)

      // Pre-expansion: motion past the drag threshold cancels the hold.
      // The cell goes back to collapsed and lets the parent handle the drag
      // (e.g. ContactRow's horizontal swipe).
      if (press.expandedAt === null) {
        if (dist >= DRAG_THRESHOLD) {
          collapse()
        }
        return
      }

      // Already expanded: track which action chip the pointer is over.
      const actionId = findActionAtPoint({ x: e.clientX, y: e.clientY })
      setHoveredActionId(actionId)
    },
    [collapse, findActionAtPoint],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const press = pressRef.current
      if (!press || press.pointerId !== e.pointerId) return
      const now = performance.now()
      const heldMs = now - press.startTime
      const dx = e.clientX - press.startX
      const dy = e.clientY - press.startY
      const dist = Math.hypot(dx, dy)
      const expandedAt = press.expandedAt

      // Reset session state up front; we'll override below for the commit
      // animation case.
      cancelHoldTimer()
      pressRef.current = null

      // Case A: never expanded. Treat as tap if short + still.
      if (expandedAt === null) {
        if (heldMs <= HOLD_MS + HOLD_TAP_GRACE_MS && dist < DRAG_THRESHOLD) {
          setState('collapsed')
          setHoveredActionId(null)
          onTap?.()
          return
        }
        // Held past the threshold but the timer hadn't fired yet (rare).
        // No action.
        setState('collapsed')
        setHoveredActionId(null)
        return
      }

      // Case B: expanded. Did we land on a chip?
      const actionId = findActionAtPoint({ x: e.clientX, y: e.clientY })
      if (actionId) {
        const action = actions.find((a) => a.id === actionId)
        if (action) {
          setState('committing')
          action.onAction()
          // Hold the committing visual for one frame so the chip's highlight
          // reads as fired before the cell collapses.
          window.setTimeout(() => {
            setState('collapsed')
            setHoveredActionId(null)
          }, 120)
          return
        }
      }
      // Lifted somewhere inside the expanded cell but not on a chip.
      setState('collapsed')
      setHoveredActionId(null)
    },
    [actions, cancelHoldTimer, findActionAtPoint, onTap],
  )

  const onPointerCancel = useCallback(() => {
    collapse()
  }, [collapse])

  // Tear down any pending timer on unmount.
  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current)
      }
    }
  }, [])

  const expanded = state === 'expanded' || state === 'committing'

  return (
    <motion.div
      ref={rootRef}
      layout
      data-testid={`expandable-${id}`}
      data-variant={variant}
      data-state={state}
      data-expansion-axis={expansionAxis}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', stiffness: 280, damping: 28, mass: 0.5 }
      }
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: expansionAxis === 'horizontal' ? 'row' : 'column',
        alignItems: expansionAxis === 'horizontal' ? 'stretch' : 'stretch',
        gap: expanded ? 8 : 0,
        borderRadius: 10,
        boxShadow: expanded
          ? '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08)'
          : '0 0 0 0 rgba(0,0,0,0)',
        background: expanded ? 'rgba(255,255,255,0.06)' : 'transparent',
        outline: expanded
          ? '1px solid rgba(120, 220, 240, 0.35)'
          : '1px solid transparent',
        touchAction: 'none',
        cursor: 'pointer',
        zIndex: expanded ? 2 : 'auto',
      }}
      className={className}
    >
      <motion.div
        layout
        data-testid={`expandable-content-${id}`}
        style={{ display: 'flex', flex: '1 1 auto', minWidth: 0 }}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            layout
            data-testid={`expandable-actions-${id}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: expansionAxis === 'horizontal' ? -8 : 0, y: expansionAxis === 'vertical' ? -8 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: expansionAxis === 'horizontal' ? -8 : 0, y: expansionAxis === 'vertical' ? -8 : 0 }}
            transition={
              reduced
                ? { duration: 0.12 }
                : { type: 'spring', stiffness: 320, damping: 28, mass: 0.5 }
            }
            style={{
              display: 'flex',
              flexDirection: expansionAxis === 'horizontal' ? 'row' : 'row',
              flexWrap: 'wrap',
              gap: 6,
              padding: expansionAxis === 'horizontal' ? '6px 8px' : '4px 8px 8px',
              alignItems: 'center',
              alignSelf: 'stretch',
              justifyContent: expansionAxis === 'horizontal' ? 'flex-end' : 'flex-start',
            }}
          >
            {actions.map((action) => (
              <ActionChip
                key={action.id}
                action={action}
                hovered={hoveredActionId === action.id}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ActionChipProps {
  action: CellAction
  hovered: boolean
}

const TONE_COLOR: Record<CellActionTone, string> = {
  call: 'var(--action-call)',
  text: 'var(--action-text)',
  favorite: 'var(--accent-amber, #FFB478)',
  info: 'var(--accent-cyan, rgba(120, 220, 240, 0.85))',
  neutral: 'rgba(255,255,255,0.18)',
}

function ActionChip({ action, hovered }: ActionChipProps) {
  const tone = action.tone ?? (action.variant === 'primary' ? 'call' : 'neutral')
  const filled = action.variant !== 'secondary'
  const baseColor = TONE_COLOR[tone]

  return (
    <motion.div
      data-expandable-chip="true"
      data-action-id={action.id}
      data-tone={tone}
      data-variant={action.variant ?? 'primary'}
      data-state={hovered ? 'hovered' : 'idle'}
      role="button"
      aria-label={action.label}
      animate={{
        scale: hovered ? 1.06 : 1,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.5 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
        minWidth: 44,
        padding: '0 14px',
        borderRadius: 22,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color: filled ? '#fff' : 'rgba(255,255,255,0.92)',
        background: filled ? baseColor : 'rgba(255,255,255,0.10)',
        border: hovered
          ? '1.5px solid var(--accent-cyan, rgba(120, 220, 240, 0.95))'
          : filled
          ? '1px solid rgba(0,0,0,0.10)'
          : '1px solid rgba(255,255,255,0.20)',
        boxShadow: hovered
          ? '0 0 0 3px rgba(120, 220, 240, 0.28), 0 4px 14px rgba(120, 220, 240, 0.30)'
          : '0 1px 3px rgba(0,0,0,0.18)',
        whiteSpace: 'nowrap',
      }}
    >
      {action.icon !== undefined && (
        <span aria-hidden style={{ display: 'inline-flex', fontSize: 14 }}>
          {action.icon}
        </span>
      )}
      <span>{action.label}</span>
    </motion.div>
  )
}
