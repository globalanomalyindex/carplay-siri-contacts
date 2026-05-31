import { AnimatePresence, motion } from 'motion/react'
import { easing } from '../../tokens/motion'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface ScreenEdgeAuraProps {
  active: boolean
}

interface FluidBlobProps {
  color: string
  /** Anchor x as a percentage of the parent (e.g. "5%"). */
  startX: string
  /** Anchor y as a percentage of the parent. */
  startY: string
  delay: number
  duration: number
  /** Width of the blob as a percentage of the parent. */
  size: number
  /** Peak opacity reached mid-cycle. */
  peakOpacity: number
}

/**
 * Rainbow halo around the CarPlay screen when Siri is listening. Built from
 * a stack of slow-moving radial-gradient "blobs" of Siri palette colors. Each
 * blob is anchored at one of eight points around the perimeter (four corners
 * + four edge midpoints) and only drifts within a small radius of that anchor,
 * so the rainbow ring stays evenly distributed around all four edges.
 *
 * Layout note: the container uses `inset: -40px` so blobs at the corner
 * anchors extend the bloom OUTWARD past the screen frame as well as inward.
 * Heavy gaussian blur (48px) smooths the eight blob silhouettes into a single
 * continuous glow. Center stays clean because no blob is anchored there.
 *
 * Reduced motion: blobs hold at peak opacity, no translation or scale.
 */
export function ScreenEdgeAura({ active }: ScreenEdgeAuraProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="screen-edge-aura"
          data-variant="fluid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: easing.liquidOut }}
          style={{
            position: 'absolute',
            // Extend past the screen edges so blobs anchored at the corners
            // bleed outward into the surrounding tray as well as inward.
            inset: '-40px',
            pointerEvents: 'none',
            overflow: 'visible',
            borderRadius: 30,
            zIndex: 0,
          }}
        >
          {/* Four corners + four edge midpoints. Each blob has a unique
              duration so they desynchronise into fluid motion, but their
              anchor positions guarantee even rainbow coverage on all sides.
              Colors cycle through the Siri palette around the ring. */}
          <FluidBlob color="#FF6E7F" startX="5%"  startY="5%"  delay={0}    duration={9}  size={46} peakOpacity={0.68} />
          <FluidBlob color="#FFD86B" startX="50%" startY="5%"  delay={1.2}  duration={11} size={44} peakOpacity={0.66} />
          <FluidBlob color="#FFA56B" startX="95%" startY="5%"  delay={2.4}  duration={13} size={46} peakOpacity={0.68} />
          <FluidBlob color="#6BFFD1" startX="95%" startY="50%" delay={3.6}  duration={10} size={44} peakOpacity={0.66} />
          <FluidBlob color="#6B9AFF" startX="95%" startY="95%" delay={4.8}  duration={12} size={46} peakOpacity={0.68} />
          <FluidBlob color="#B573FF" startX="50%" startY="95%" delay={6.0}  duration={14} size={44} peakOpacity={0.66} />
          <FluidBlob color="#FF6EC4" startX="5%"  startY="95%" delay={7.2}  duration={9}  size={46} peakOpacity={0.68} />
          <FluidBlob color="#FF6E7F" startX="5%"  startY="50%" delay={8.4}  duration={11} size={44} peakOpacity={0.66} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FluidBlob({
  color,
  startX,
  startY,
  delay,
  duration,
  size,
  peakOpacity,
}: FluidBlobProps) {
  const reduced = useReducedMotion()
  // Lift the whole band and hold a floor so the eight blobs always overlap
  // into one continuous rainbow ring instead of pulsing in and out of gaps.
  const peak = Math.min(1, peakOpacity * 1.15)

  return (
    <motion.div
      aria-hidden
      initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
      animate={
        reduced
          ? { x: 0, y: 0, scale: 1, opacity: peak * 0.9 }
          : {
              // Small drift loop (~80-120px) so the blob stays near its
              // anchor and the rainbow ring's distribution is preserved.
              x: [0, 40, -30, 50, 0],
              y: [0, -40, 30, -20, 0],
              scale: [1, 1.12, 0.92, 1.08, 1],
              // Floor never returns to 0: the ring stays continuous and only
              // breathes in intensity as blobs drift across one another.
              opacity: [peak * 0.6, peak, peak * 0.72, peak, peak * 0.6],
            }
      }
      transition={
        reduced
          ? { duration: 0.4, ease: 'easeOut' }
          : {
              duration,
              // Compress the start offsets so the whole ring blooms within
              // ~1.5s of Siri waking. The varied durations still desync the
              // drift forever, so the ring never pulses in lockstep.
              delay: delay * 0.18,
              repeat: Infinity,
              ease: 'easeInOut',
            }
      }
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: `${size}%`,
        height: `${size}%`,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${color} 0%, ${color}00 70%)`,
        filter: 'blur(48px)',
        mixBlendMode: 'screen',
        willChange: 'transform, opacity',
      }}
    />
  )
}
