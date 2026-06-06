import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useMagnifierContext } from './MagnifierContext'
import { useMagnifiable } from './useMagnifiable'
import { dur, easing, springs } from '../../tokens/motion'
import { space } from '../../tokens/spatial'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import { lockHaptic } from '../haptics'
import type { MagnifierBehavior, MagnifierRegion } from './types'

export interface MagnifiableFrameProps {
  id: string
  onCommit: (point?: { x: number; y: number }) => void
  behavior?: MagnifierBehavior
  /** Spatial region for hit-test gating. Defaults to 'content'. */
  region?: MagnifierRegion
  /**
   * Quickdraw: commit the instant the lens locks on, not on lift. The dock
   * sets this so a drag across it switches surfaces live.
   */
  quickdraw?: boolean
  label?: string
  index?: number
  /**
   * Persistent toggle state of the control, when it has one (the active dock
   * surface, the selected tab). Reflected as aria-pressed on the single
   * interactive node so a keyboard or screen-reader user hears the current
   * selection. Leave undefined for controls without a sticky on/off state
   * (a plain contact row), so no aria-pressed is emitted.
   */
  selected?: boolean
  children: ReactNode
  className?: string
}

/**
 * Lifetime of the on-cell success flash. Slightly longer than the toast's
 * appearance so the eye reads "this is the thing that just fired".
 */
const COMMIT_FLASH_MS = 360

export function MagnifiableFrame({
  id,
  onCommit,
  behavior = 'snapToCenter',
  region = 'content',
  quickdraw = false,
  label,
  index = 0,
  selected,
  children,
  className,
}: MagnifiableFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { lockedId, rotaryActive, lastCommittedId, lastCommittedAt } = useMagnifierContext()
  const reduced = useReducedMotion()

  useMagnifiable({ id, ref, behavior, onCommit, label, region, quickdraw })

  const locked = lockedId === id
  const stagger = Math.min(index * 0.02, 0.10)

  // Non-visual lock cue. On a FRESH lock (the lens just settled on this control)
  // give the driver a confirmation they do not have to look for: the visual
  // settle scale handles the eye, and where the platform supports it a single
  // 10ms haptic tick handles the hand. It fires once per lock acquisition, never
  // on every pointer sample, and is suppressed under reduced motion (vibration
  // is itself motion the user opted out of). The capability check lives in
  // lockHaptic.
  const wasLockedRef = useRef(false)
  useEffect(() => {
    if (locked && !wasLockedRef.current) {
      lockHaptic(reduced)
    }
    wasLockedRef.current = locked
  }, [locked, reduced])

  // The keyboard path. This frame is the single interactive node per control
  // (the inner glyph / pill is presentational), so Tab lands here and Enter or
  // Space fires the exact same commit a pointer tap-and-lift fires: onCommit().
  // No nested role="button" means the accessibility tree has one node per
  // control and no double-activation.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        onCommit()
      }
    },
    [onCommit],
  )

  // Track the most recently SHOWN commit timestamp. The render derives
  // `flashActive` from the published timestamp vs. the dismissed-at ref;
  // a useEffect schedules a re-render after COMMIT_FLASH_MS to clear it.
  // This avoids the "setState in effect" warning while still being pure
  // during render. AnimatePresence keyed on lastCommittedAt re-mounts the
  // overlay on every commit so the flash retriggers.
  const [dismissedAt, setDismissedAt] = useState(0)
  const isOurCommit = lastCommittedId === id && lastCommittedAt > 0
  const flashActive = isOurCommit && lastCommittedAt > dismissedAt
  useEffect(() => {
    if (!isOurCommit) return
    if (lastCommittedAt <= dismissedAt) return
    const at = lastCommittedAt
    const timer = window.setTimeout(() => setDismissedAt(at), COMMIT_FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [isOurCommit, lastCommittedAt, dismissedAt])

  return (
    <motion.div
      ref={ref}
      data-testid={`magnifiable-${id}`}
      data-variant="magnifiable-frame"
      data-state={locked ? 'locked' : rotaryActive ? 'active' : 'idle'}
      data-locked={locked || undefined}
      data-region={region}
      data-flashing={flashActive || undefined}
      role="button"
      tabIndex={0}
      aria-label={label}
      // Persistent selection (active dock surface / tab) -> aria-pressed.
      // Undefined when the control has no sticky on/off state, so a plain row
      // emits no pressed state.
      aria-pressed={selected}
      // The transient magnifier lock marks the control the lens is resting on,
      // so a screen-reader user driving the pointer hears which one is live.
      aria-current={locked ? true : undefined}
      onKeyDown={onKeyDown}
      animate={{
        // The loupe. Small discrete controls (dock icons, tabs) swell toward
        // the finger so the hit area grows (Fitts' Law). That magnification is a
        // functional affordance, so it holds even under reduced motion. Full-
        // width rows are already wide, so a full loupe would overflow the
        // screen; instead the primary call target gives a small forward settle
        // on lock (1.04x), and the lens halo over it is strengthened (see
        // LiquidLens). The settle is decorative, so reduced motion drops it.
        scale:
          rotaryActive && locked
            ? region !== 'content'
              ? space.magnifyScale
              : reduced
              ? 1
              : space.contentSettleScale
            : 1,
        // The rich glass (chromatic rim, convex dome, glow) is painted by the
        // shared LiquidLens overlay so it is never clipped. Here we keep only a
        // faint base under the lens to ground the magnified cell.
        boxShadow: rotaryActive
          ? locked
            ? 'inset 0 0 0 1px rgba(255,255,255,0.16), 0 2px 8px rgba(0,0,0,0.18)'
            : '0 0 0 1.5px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.14)'
          : '0 0 0 0px rgba(120,220,240,0)',
        backgroundColor: rotaryActive && locked
          ? 'rgba(190,225,255,0.10)'
          : rotaryActive
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0)',
      }}
      transition={
        locked
          ? reduced
            ? { duration: 0.12, ease: easing.frameEmerge }
            : {
                // Apple-spring lock-on with a hint of overshoot so the target
                // pops toward the finger as it swells.
                type: 'spring',
                ...springs.lockSnap,
              }
          : {
              // Cubic easing for the staggered fade-in of every cell when
              // rotary begins. Springs would all over-shoot in unison.
              duration: rotaryActive ? dur.frameEmerge : 0.12,
              ease: easing.frameEmerge,
              delay: rotaryActive && !locked ? stagger : 0,
            }
      }
      style={{
        borderRadius: 8,
        position: 'relative',
        // Grow away from the left rail so the magnify never pushes a cell off
        // the screen's left edge; tabs grow from their centre.
        transformOrigin: region === 'tabs' ? 'center' : 'left center',
        // Lift the magnified target above its neighbours so the swell reads
        // as the cell coming forward rather than colliding with the list.
        zIndex: locked ? 3 : undefined,
      }}
      className={className}
    >
      {children}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            key={lastCommittedAt}
            data-testid={`commit-flash-${id}`}
            data-variant="commit-flash"
            aria-hidden
            initial={{ opacity: 0, scale: 1 }}
            // Scale pulse 1 -> 1.06 -> 1 paired with a green wash + glow.
            // Reduced motion: opacity-only fade, no scale.
            animate={
              reduced
                ? { opacity: [0, 0.35, 0], scale: 1 }
                : { opacity: [0, 0.45, 0], scale: [1, 1.06, 1] }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: COMMIT_FLASH_MS / 1000,
              ease: easing.snapFire,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              pointerEvents: 'none',
              background: 'var(--action-call, #34C759)',
              boxShadow:
                '0 0 32px var(--action-call, #34C759),' +
                ' inset 0 0 0 2px rgba(255, 255, 255, 0.45)',
              mixBlendMode: 'screen',
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
