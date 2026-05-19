import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface ScreenEdgeAuraProps {
  active: boolean
}

/**
 * Rainbow bloom that haloes the CarPlay screen when Siri is listening. Two
 * stacked rotating conic gradients sit BEHIND the screen chrome and bleed
 * past its rounded edge into the surrounding tray. The screen's own
 * overflow:hidden clips the inside, so the bloom only kisses the very edge
 * of the rounded corner inside the viewport while glowing freely outside.
 *
 *   - outer  : large, heavy blur, slow clockwise rotation (8s).
 *   - inner  : tighter blur, opacity pulse on a 3s cycle, counter-rotation,
 *              blended via screen so the rim shimmers without going dark.
 *
 * App content remains 100% readable: the bloom never touches the interior
 * of the screen. The crisp inset rim (white-edge + soft Siri-purple inner
 * glow) is provided by a sibling, ScreenEdgeAuraRim, that sits ON TOP of
 * the chrome.
 *
 * Reduced motion: rainbow is static, no rotation or opacity pulse.
 */
export function ScreenEdgeAura({ active }: ScreenEdgeAuraProps) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="screen-edge-aura"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            // Stays behind the chrome via its own positioning context: the
            // App-level layout places this *before* the chrome wrapper.
            zIndex: 0,
          }}
        >
          {/* Outer bloom: oversized so the rainbow leaks just past the screen
              edge, heavy blur, slow rotation (5s) so the user can clearly see
              the palette drift but the motion stays calm. */}
          <motion.div
            aria-hidden
            animate={reduced ? { rotate: 0 } : { rotate: 360 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 5, ease: 'linear', repeat: Infinity }
            }
            style={{
              position: 'absolute',
              inset: '-44px',
              background:
                'conic-gradient(from 0deg,' +
                ' #FF6E7F, #FFA56B, #FFD86B, #B8FF8E, #6BFFD1,' +
                ' #6BE0FF, #6B9AFF, #B573FF, #FF6EC4, #FF6E7F)',
              filter: 'blur(40px)',
              opacity: 0.85,
              borderRadius: 30,
            }}
          />

          {/* Inner accent: counter-rotates, pulses opacity, sits just past the
              screen edge to give a sharper hue at the rim. Screen-blended so
              it adds rather than replaces the outer bloom's color. Faster
              rotation (4s) creates the swirl effect when stacked against the
              5s outer bloom. */}
          <motion.div
            aria-hidden
            animate={
              reduced
                ? { rotate: 0, opacity: 0.6 }
                : { rotate: -360, opacity: [0.45, 0.85, 0.45] }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    rotate: { duration: 4, ease: 'linear', repeat: Infinity },
                    opacity: { duration: 3, ease: 'easeInOut', repeat: Infinity },
                  }
            }
            style={{
              position: 'absolute',
              inset: '-18px',
              background:
                'conic-gradient(from 200deg,' +
                ' #FF6E7F, #B573FF, #6B9AFF, #6BFFD1, #B8FF8E,' +
                ' #FFD86B, #FFA56B, #FF6E7F)',
              filter: 'blur(20px)',
              borderRadius: 22,
              mixBlendMode: 'screen',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
