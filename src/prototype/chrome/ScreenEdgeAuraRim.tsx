import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface ScreenEdgeAuraRimProps {
  active: boolean
}

/**
 * The crisp inset rim that pairs with ScreenEdgeAura's outer bloom. Sits ON
 * TOP of the chrome and paints a thin white-edge highlight plus a soft
 * Siri-purple inner glow that hugs the screen's rounded corner exactly.
 * Together with the bloom, the screen reads as "selected" the instant Siri
 * activates, even before the bloom fully fades in.
 *
 * Reduced motion: no opacity pulse, constant.
 */
export function ScreenEdgeAuraRim({ active }: ScreenEdgeAuraRimProps) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="screen-edge-aura-rim"
          initial={{ opacity: 0 }}
          animate={
            reduced
              ? { opacity: 0.9 }
              : { opacity: [0.75, 1, 0.75] }
          }
          exit={{ opacity: 0 }}
          transition={
            reduced
              ? { duration: 0.2 }
              : { opacity: { duration: 3, ease: 'easeInOut', repeat: Infinity } }
          }
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow:
              'inset 0 0 0 1.5px rgba(255, 255, 255, 0.45),' +
              ' inset 0 0 22px rgba(180, 150, 255, 0.55),' +
              ' inset 0 0 60px rgba(107, 154, 255, 0.18)',
          }}
        />
      )}
    </AnimatePresence>
  )
}
