import { motion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useMagnifierContext } from './MagnifierContext'
import { useMagnifiable } from './useMagnifiable'
import { dur, easing } from '../../tokens/motion'
import type { MagnifierBehavior } from './types'

export interface MagnifiableFrameProps {
  id: string
  onCommit: (point?: { x: number; y: number }) => void
  behavior?: MagnifierBehavior
  label?: string
  index?: number
  children: ReactNode
  className?: string
}

export function MagnifiableFrame({
  id,
  onCommit,
  behavior = 'snapToCenter',
  label,
  index = 0,
  children,
  className,
}: MagnifiableFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { lockedId, rotaryActive } = useMagnifierContext()

  useMagnifiable({ id, ref, behavior, onCommit, label })

  const locked = lockedId === id
  const stagger = Math.min(index * 0.02, 0.10)

  return (
    <motion.div
      ref={ref}
      data-testid={`magnifiable-${id}`}
      data-variant="magnifiable-frame"
      data-state={locked ? 'locked' : rotaryActive ? 'active' : 'idle'}
      data-locked={locked || undefined}
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
    </motion.div>
  )
}
