import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import { useMagnifierSession } from './MagnifierSessionContext'
import { useMagnifierContext } from './MagnifierContext'
import { space } from '../../tokens/spatial'
import { springs } from '../../tokens/motion'

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
  | 'armed'
  | 'sliding'
  | 'expanded'
  | 'committing'

export interface ExpandableCellProps {
  id: string
  /**
   * Direction the cell grows when expanded.
   * 'horizontal' floats the action chips out to the right of the cell (dock).
   * 'vertical' arranges action chips below the cell content (rows).
   */
  expansionAxis: 'horizontal' | 'vertical'
  /** Render variant for design-system export. Defaults to 'row'. */
  variant?: ExpandableCellVariant
  /** Actions revealed when the cell is held in place (the contextual menu). */
  actions: CellAction[]
  /** When set, a quick tap (no hold) fires this. The primary action of the cell. */
  onTap?: () => void
  /** Cell content rendered in every state. */
  children: ReactNode
  /** aria-label for the cell as a whole. */
  label?: string
  /** Outer className passthrough. */
  className?: string
}

/** Hold this long, then a slide hands off to the magnifier. */
const HOLD_ARM_MS = space.holdArmMs
/** Keep holding in place this long, and the contextual menu opens. */
const HOLD_MENU_MS = space.holdMenuMs
/** A pre-arm move past this yields the gesture (e.g. to a row swipe). */
const DRAG_THRESHOLD = space.thresholdDragDistPx
/** A post-arm move past this is a decisive slide into the magnifier. */
const SLIDE_THRESHOLD = space.slideThresholdPx
/** Slack so a lift just after a threshold still reads as the same intent. */
const TAP_GRACE_MS = 60

interface PressState {
  pointerId: number
  startX: number
  startY: number
  startTime: number
  armed: boolean
  sliding: boolean
  /** Set when the menu (hold-in-place) opens. */
  expandedAt: number | null
}

/**
 * The unified press recognizer for a magnifiable control. One gesture surface,
 * four outcomes:
 *
 *   - Quick tap -> the cell's primary action (onTap).
 *   - Hold ~180ms, then slide -> hands off to the shared magnifier session: the
 *     liquid lens lifts off this cell and flows wherever the finger goes
 *     (dock -> tabs -> rows, no lift), committing whatever it lands on.
 *   - Keep holding ~480ms in place -> this cell's contextual menu opens; drift
 *     to a chip and lift to fire it.
 *   - A pre-arm move yields the gesture (a row's swipe-to-call/text path owns
 *     quick horizontal drags).
 *
 * No pointer capture: Motion's `layout` reflow breaks capture, so window-level
 * listeners are the load-bearing path (they also survive a list reflow).
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
  const session = useMagnifierSession()
  const { menuRequest, clearMenuRequest } = useMagnifierContext()
  const rootRef = useRef<HTMLDivElement>(null)
  const pressRef = useRef<PressState | null>(null)
  const armTimerRef = useRef<number | null>(null)
  const menuTimerRef = useRef<number | null>(null)
  const handledMenuAtRef = useRef(0)
  const [state, setState] = useState<ExpandableCellState>('collapsed')
  const [hoveredActionId, setHoveredActionId] = useState<string | null>(null)

  const cancelTimers = useCallback(() => {
    if (armTimerRef.current !== null) {
      window.clearTimeout(armTimerRef.current)
      armTimerRef.current = null
    }
    if (menuTimerRef.current !== null) {
      window.clearTimeout(menuTimerRef.current)
      menuTimerRef.current = null
    }
  }, [])

  const collapse = useCallback(() => {
    cancelTimers()
    pressRef.current = null
    setState('collapsed')
    setHoveredActionId(null)
  }, [cancelTimers])

  /**
   * Find the action chip under the point, falling back to the nearest chip
   * within 28pt so a small overshoot still highlights the obvious target.
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
        if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
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
      if (nearest !== null) {
        const n = nearest as { id: string; dist: number }
        if (n.dist <= 28) return n.id
      }
      return null
    },
    [],
  )

  const resolveMove = useCallback(
    (x: number, y: number) => {
      const press = pressRef.current
      if (!press) return
      const dist = Math.hypot(x - press.startX, y - press.startY)

      // Already handed off: the session controller drives the lens from here.
      if (press.sliding) return

      // Menu open: highlight the chip under the finger.
      if (press.expandedAt !== null) {
        setHoveredActionId(findActionAtPoint({ x, y }))
        return
      }

      // Pre-arm: a real move yields the gesture (the row's swipe path takes it).
      if (!press.armed) {
        if (dist >= DRAG_THRESHOLD) collapse()
        return
      }

      // Armed: a decisive slide lifts the lens off this cell and into the
      // magnifier, where it flows across the whole UI until the finger lifts.
      if (dist >= SLIDE_THRESHOLD) {
        press.sliding = true
        cancelTimers()
        setState('sliding')
        setHoveredActionId(null)
        session.beginSlide({ x, y })
      }
    },
    [cancelTimers, collapse, session, findActionAtPoint],
  )

  const resolveUp = useCallback(
    (x: number, y: number) => {
      const press = pressRef.current
      if (!press) return
      const heldMs = performance.now() - press.startTime
      const dist = Math.hypot(x - press.startX, y - press.startY)
      const wasSliding = press.sliding
      const wasExpanded = press.expandedAt !== null

      cancelTimers()
      pressRef.current = null

      // Slid into the magnifier: the session controller commits the lift; this
      // cell only resets its own visual state (it may even have unmounted).
      if (wasSliding) {
        setState('collapsed')
        setHoveredActionId(null)
        return
      }

      // Menu open: fire the chip under the finger, else collapse.
      if (wasExpanded) {
        const actionId = findActionAtPoint({ x, y })
        const action = actionId ? actions.find((a) => a.id === actionId) : null
        if (action) {
          setState('committing')
          action.onAction()
          window.setTimeout(() => {
            setState('collapsed')
            setHoveredActionId(null)
          }, 120)
          return
        }
        setState('collapsed')
        setHoveredActionId(null)
        return
      }

      // No slide, no menu: a tap fires the primary action if it stayed put.
      setState('collapsed')
      setHoveredActionId(null)
      if (dist < DRAG_THRESHOLD && heldMs <= HOLD_MENU_MS + TAP_GRACE_MS) {
        onTap?.()
      }
    },
    [actions, cancelTimers, findActionAtPoint, onTap],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pressRef.current) return
      pressRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTime: performance.now(),
        armed: false,
        sliding: false,
        expandedAt: null,
      }
      setState('pressing')

      cancelTimers()
      armTimerRef.current = window.setTimeout(() => {
        const p = pressRef.current
        if (!p || p.pointerId !== e.pointerId || p.sliding) return
        p.armed = true
        setState('armed')
      }, HOLD_ARM_MS)
      menuTimerRef.current = window.setTimeout(() => {
        const p = pressRef.current
        if (!p || p.pointerId !== e.pointerId || p.sliding) return
        p.armed = true
        p.expandedAt = performance.now()
        setState('expanded')
      }, HOLD_MENU_MS)
    },
    [cancelTimers],
  )

  // React handlers (so unit tests can fireEvent them).
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => resolveMove(e.clientX, e.clientY),
    [resolveMove],
  )
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => resolveUp(e.clientX, e.clientY),
    [resolveUp],
  )
  const onPointerCancel = useCallback(() => {}, [])

  // Window listeners are the load-bearing path through Motion's layout reflows.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      resolveMove(e.clientX, e.clientY)
    }
    function onUp(e: PointerEvent) {
      resolveUp(e.clientX, e.clientY)
    }
    function onCancel(e: PointerEvent) {
      // The implicit Motion-layout cancel arrives at (0,0) with the pointer
      // still down; ignore it. A genuine OS cancel carries real coordinates.
      if (e.clientX === 0 && e.clientY === 0) return
      // The session controller ends any slide it owns; this cell just collapses.
      collapse()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [collapse, resolveMove, resolveUp])

  useEffect(() => {
    return () => {
      if (armTimerRef.current !== null) window.clearTimeout(armTimerRef.current)
      if (menuTimerRef.current !== null) window.clearTimeout(menuTimerRef.current)
    }
  }, [])

  // Dwell handoff: a magnifier session rested its lens on this cell long enough
  // that the driver requested its menu. Adopt the still-held gesture by
  // synthesizing a press already in the expanded state, so the window move/lift
  // handlers below drive chip selection exactly as a hold-in-place menu would.
  // This cell may never have received the pointerdown (the press began on the
  // orb or another cell and slid here), which is why the press is synthesized.
  useEffect(() => {
    if (!menuRequest || menuRequest.id !== id) return
    if (menuRequest.at <= handledMenuAtRef.current) return
    handledMenuAtRef.current = menuRequest.at
    clearMenuRequest()
    if (actions.length === 0) return
    const now = performance.now()
    pressRef.current = {
      pointerId: -1,
      startX: menuRequest.x,
      startY: menuRequest.y,
      startTime: now,
      armed: true,
      sliding: false,
      expandedAt: now,
    }
    cancelTimers()
    // This synchronizes the cell to a one-shot interaction signal (the driver's
    // dwell-driven menu request, delivered through context). Responding to an
    // external event by setting state is a valid use of an effect, and it cannot
    // move into render because it also clears the shared request.
    /* eslint-disable react-hooks/set-state-in-effect */
    setState('expanded')
    setHoveredActionId(findActionAtPoint({ x: menuRequest.x, y: menuRequest.y }))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [menuRequest, id, actions.length, cancelTimers, clearMenuRequest, findActionAtPoint])

  const expanded = state === 'expanded' || state === 'committing'
  const horizontal = expansionAxis === 'horizontal'

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
      transition={reduced ? { duration: 0 } : { type: 'spring', ...springs.cellExpand }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: 'stretch',
        // Horizontal menus float in an absolute popover, so the cell never
        // needs in-flow gap for them.
        gap: expanded && !horizontal ? 8 : 0,
        borderRadius: 10,
        boxShadow:
          expanded && !horizontal
            ? '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08)'
            : '0 0 0 0 rgba(0,0,0,0)',
        background: expanded ? 'rgba(255,255,255,0.06)' : 'transparent',
        outline: expanded ? '1px solid rgba(120, 220, 240, 0.35)' : '1px solid transparent',
        touchAction: 'none',
        cursor: 'pointer',
        zIndex: expanded ? 6 : 'auto',
      }}
      className={className}
    >
      <div
        data-testid={`expandable-content-${id}`}
        style={{ display: 'flex', flex: '1 1 auto', minWidth: 0 }}
      >
        {children}
      </div>
      {expanded && (
        <motion.div
          data-testid={`expandable-actions-${id}`}
          initial={
            reduced
              ? { opacity: 0 }
              : horizontal
              ? { opacity: 0, scale: 0.94, x: -6 } // popover grows from the icon
              : { opacity: 0, y: -8 }
          }
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={reduced ? { duration: 0.12 } : { type: 'spring', ...springs.chipFan }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
            zIndex: 5,
            ...(horizontal
              ? {
                  // The dock's narrow rail can't hold chips, so the menu floats
                  // out to the right as a glass popover, clear of the rail edge.
                  position: 'absolute',
                  left: '100%',
                  top: 0,
                  marginLeft: 8,
                  transformOrigin: 'left center',
                  flexWrap: 'nowrap',
                  padding: 6,
                  borderRadius: 16,
                  background: 'rgba(18, 26, 34, 0.85)',
                  backdropFilter: 'blur(14px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }
              : {
                  flexWrap: 'wrap',
                  padding: '4px 8px 8px',
                  justifyContent: 'flex-start',
                }),
          }}
        >
          {actions.map((action) => (
            <ActionChip key={action.id} action={action} hovered={hoveredActionId === action.id} />
          ))}
        </motion.div>
      )}
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
  const [focused, setFocused] = useState(false)
  // A chip is "active" when the magnifier hovers it OR a keyboard user focuses
  // it, so the lit affordance is identical across input methods.
  const active = hovered || focused

  return (
    <motion.div
      data-expandable-chip="true"
      data-action-id={action.id}
      data-tone={tone}
      data-variant={action.variant ?? 'primary'}
      data-state={hovered ? 'hovered' : 'idle'}
      role="button"
      tabIndex={0}
      aria-label={action.label}
      // Keyboard path to the same handler the magnifier lift fires. The whole
      // thesis is that every action is reachable without precise pointing, so a
      // chip the pointer can hit must also answer to Enter and Space.
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          action.onAction()
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      animate={{ scale: active ? 1.06 : 1 }}
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
        outline: 'none',
        cursor: 'pointer',
        color: filled ? '#fff' : 'rgba(255,255,255,0.92)',
        background: filled ? baseColor : 'rgba(255,255,255,0.10)',
        border: active
          ? '1.5px solid var(--accent-cyan, rgba(120, 220, 240, 0.95))'
          : filled
          ? '1px solid rgba(0,0,0,0.10)'
          : '1px solid rgba(255,255,255,0.20)',
        boxShadow: active
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
