import { AnimatePresence, motion } from 'motion/react'
import { dur, easing } from '../../tokens/motion'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface AuraProps {
  active: boolean
  /** Size of the aura's source (the orb); aura blurs out from there. */
  size?: number
}

/**
 * The rainbow gradient aura that surrounds the orb while Siri is listening.
 * Pulses opacity 50-75% on a 3s cycle. Static under Reduce Motion.
 */
export function Aura({ active, size = 34 }: AuraProps) {
  const reduced = useReducedMotion()
  const auraSize = size * 3

  // Toned down from the original full-strength aura: the screen-edge rainbow
  // halo (see ScreenEdgeAura) is now the primary "Siri is listening" signal.
  // This local pulse remains as a soft accent grounding the orb itself, but
  // its opacity is dialed back so it does not compete with the edge halo.
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="siri-aura"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={
            reduced
              ? { opacity: 0.35, scale: 1 }
              : { opacity: [0.25, 0.40, 0.25], scale: [1, 1.12, 1] }
          }
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
          transition={
            reduced
              ? { duration: 0.2 }
              : { duration: dur.auraCycle, ease: easing.ambientBreathe, repeat: Infinity }
          }
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: auraSize,
            height: auraSize,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'conic-gradient(from 200deg, #FF6E7F, #FFD86B, #6BFFD1, #6B9AFF, #B573FF, #FF6E7F)',
            filter: 'blur(22px)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
    </AnimatePresence>
  )
}
