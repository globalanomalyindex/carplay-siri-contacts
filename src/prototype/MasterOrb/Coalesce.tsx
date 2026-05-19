import { useMemo } from 'react'
import { motion } from 'motion/react'
import { dur, easing } from '../../tokens/motion'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface CoalesceProps {
  active: boolean
  /** World-space origin point in pixels (where particles fly FROM). */
  from: { x: number; y: number }
  /** World-space target point (the orb's home center). */
  to: { x: number; y: number }
  /** Fires when the reform animation completes, so the parent can clear state. */
  onComplete?: () => void
}

const PARTICLE_COUNT = 10

/**
 * Inverse of Dissipation: rainbow particles converge from `from` (last pointer
 * position) to `to` (the orb's home center). Used for the reform animation when
 * rotary mode ends without a commit. Reduced-motion mode skips the particles
 * entirely (parent should crossfade instead).
 */
export function Coalesce({ active, from, to, onComplete }: CoalesceProps) {
  const reduced = useReducedMotion()

  // Particles start scattered around the origin (mirrors the Dissipation
  // burst pattern), then sweep to the orb home. Seeded with a deterministic
  // hash keyed by index so the swarm looks organic without using Math.random.
  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      const jitter = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
      const distance = 22 + jitter * 18
      return {
        i,
        startDx: Math.cos(angle) * distance,
        startDy: Math.sin(angle) * distance,
      }
    })
  }, [active])

  if (!active || reduced) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {particles.map(({ i, startDx, startDy }) => (
        <motion.div
          key={i}
          data-testid="coalesce-particle"
          initial={{
            x: from.x + startDx,
            y: from.y + startDy,
            opacity: 0,
            scale: 0.4,
          }}
          animate={{
            x: to.x,
            y: to.y,
            opacity: [0, 0.9, 0],
            scale: [0.4, 1, 0.6],
          }}
          transition={{
            duration: dur.reform,
            ease: easing.liquidIn,
          }}
          onAnimationComplete={i === 0 ? onComplete : undefined}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background:
              'conic-gradient(from 200deg, #FF6E7F, #FFD86B, #6BFFD1, #6B9AFF, #B573FF, #FF6E7F)',
            filter: 'blur(1.5px)',
          }}
        />
      ))}
    </div>
  )
}
