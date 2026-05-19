import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMagnifierContext } from './MagnifierContext'
import { useMagnifiable } from './useMagnifiable'
import { dur, easing } from '../../tokens/motion'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import type { MagnifierBehavior, QuickAction } from './types'

export interface MagnifiableFrameProps {
  id: string
  onCommit: (point?: { x: number; y: number }) => void
  behavior?: MagnifierBehavior
  label?: string
  index?: number
  children: ReactNode
  className?: string
  /**
   * Optional cardinal-quadrant menu. When set, a long-press on this
   * cell opens the QuickActions menu instead of starting rotary mode.
   * Tap still routes through the underlying child.
   */
  quickActions?: QuickAction[]
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
  label,
  index = 0,
  children,
  className,
  quickActions,
}: MagnifiableFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { lockedId, rotaryActive, lastCommittedId, lastCommittedAt } = useMagnifierContext()
  const reduced = useReducedMotion()

  useMagnifiable({ id, ref, behavior, onCommit, label, quickActions })

  const locked = lockedId === id
  const stagger = Math.min(index * 0.02, 0.10)

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
      data-flashing={flashActive || undefined}
      animate={{
        boxShadow: rotaryActive
          ? locked
            ? '0 0 0 2px rgba(120,220,240,0.85), 0 0 24px rgba(120,220,240,0.55), 0 0 8px rgba(120,220,240,0.40)'
            : '0 0 0 1.5px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.15)'
          : '0 0 0 0px rgba(120,220,240,0)',
        backgroundColor: rotaryActive && locked
          ? 'rgba(120,220,240,0.22)'
          : rotaryActive
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0)',
      }}
      transition={
        locked
          ? {
              // Apple-spring lock-on. Stiffer than tab/content so the user
              // feels the cell snap close, with damping that settles fast.
              type: 'spring',
              stiffness: 320,
              damping: 30,
              mass: 0.5,
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
