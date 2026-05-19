import { motion } from 'motion/react'
import { dur, easing } from '../../tokens/motion'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import type { CSSProperties } from 'react'

export interface OrbProps {
  /** Override the orb's diameter; defaults to var(--orb-size) = 34px. */
  size?: number
  /** Disables the ambient breathing animation (e.g., when in active state). */
  breath?: boolean
  /** Optional style overrides for parent-driven transforms. */
  style?: CSSProperties
}

/**
 * The Master Orb itself. Conic-gradient Siri rainbow with inset highlight
 * and shadow for soft volumetric form. Ambient breathing loop (5% scale,
 * 2 degree rotation, 6s cycle) unless `breath={false}` or the user has
 * Reduce Motion enabled.
 */
export function Orb({ size = 34, breath = true, style }: OrbProps) {
  const reduced = useReducedMotion()
  const animateBreath = breath && !reduced
  return (
    <motion.div
      data-testid="master-orb"
      animate={
        animateBreath
          ? { scale: [1, 1.05, 1], rotate: [0, 2, 0] }
          : { scale: 1, rotate: 0 }
      }
      transition={{
        duration: dur.ambientBreathe,
        ease: easing.ambientBreathe,
        repeat: animateBreath ? Infinity : 0,
      }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'conic-gradient(from 200deg, #FF6E7F, #FFD86B, #6BFFD1, #6B9AFF, #B573FF, #FF6E7F)',
        boxShadow: [
          `0 0 12px rgba(180, 150, 255, 0.55)`,
          'inset 0 -3px 6px rgba(0, 0, 0, 0.20)',
          'inset 0 3px 6px rgba(255, 255, 255, 0.20)',
        ].join(', '),
        ...style,
      }}
    />
  )
}
