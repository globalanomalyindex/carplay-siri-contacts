import { useMemo } from 'react'
import { motion } from 'motion/react'
import { dur, easing } from '../../tokens/motion'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface DissipationProps {
  active: boolean
  /** World-space origin point in pixels (where the orb dissolved from). */
  center: { x: number; y: number }
  /** Direction radians vector to bias particle drift (optional). */
  driftAngle?: number
}

const PARTICLE_COUNT = 10

/**
 * Renders 10 rainbow particle dots that fly outward from `center`, fading
 * as they drift, simulating the orb's liquid dissolution. Reduced-motion
 * mode skips the particles entirely (parent should crossfade instead).
 */
export function Dissipation({ active, center, driftAngle }: DissipationProps) {
  const reduced = useReducedMotion()

  // Compute particle offsets purely (no Math.random in render). A small
  // deterministic jitter seeded by index keeps the dust looking organic
  // without making the render impure.
  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const baseAngle = (i / PARTICLE_COUNT) * Math.PI * 2
      const angle =
        driftAngle != null ? baseAngle + (driftAngle - baseAngle) * 0.3 : baseAngle
      // Pseudo-random in [0, 1) seeded by index. The fractional part of a
      // multiplied sine is a standard cheap hash with good enough spread for
      // a 10-particle burst.
      const jitter = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
      const distance = 22 + jitter * 18
      return {
        i,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
      }
    })
  }, [active, driftAngle])

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
      {particles.map(({ i, dx, dy }) => (
        <motion.div
          key={i}
          data-testid="dissipation-particle"
          initial={{
            x: center.x,
            y: center.y,
            opacity: 0.9,
            scale: 1,
          }}
          animate={{
            x: center.x + dx,
            y: center.y + dy,
            opacity: 0,
            scale: 0.4,
          }}
          transition={{
            duration: dur.dissipate,
            ease: easing.liquidOut,
          }}
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
