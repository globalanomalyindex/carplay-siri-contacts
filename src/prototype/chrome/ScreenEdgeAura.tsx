import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface ScreenEdgeAuraProps {
  active: boolean
}

interface FluidBlobProps {
  color: string
  startX: string
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
 * blob translates and scales on its own offset cycle, so the layered result
 * reads as fluid color flow rather than rotating bands.
 *
 * Layers, in render order:
 *   1. Five primary palette blobs around the screen edge, blended via screen.
 *   2. Two secondary, larger blobs at lower opacity to fill the gap and add
 *      depth so the rim never goes flat.
 *
 * Heavy gaussian blur (44-56px) smooths the blob silhouettes into a single
 * glow. The blobs sit BEHIND the chrome and bleed past the rounded edge into
 * the surrounding tray; screen interior stays readable because chrome content
 * paints over the bloom.
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
          transition={{ duration: 0.32 }}
          style={{
            position: 'absolute',
            inset: '-32px',
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: 30,
            zIndex: 0,
          }}
        >
          {/* Primary palette blobs - five points around the edge */}
          <FluidBlob color="#FF6E7F" startX="12%" startY="14%" delay={0}    duration={11} size={62} peakOpacity={0.70} />
          <FluidBlob color="#FFD86B" startX="78%" startY="18%" delay={1.4}  duration={13} size={60} peakOpacity={0.66} />
          <FluidBlob color="#6BFFD1" startX="85%" startY="76%" delay={2.6}  duration={9}  size={58} peakOpacity={0.72} />
          <FluidBlob color="#6B9AFF" startX="16%" startY="82%" delay={3.8}  duration={14} size={60} peakOpacity={0.68} />
          <FluidBlob color="#B573FF" startX="50%" startY="50%" delay={5.0}  duration={10} size={64} peakOpacity={0.62} />

          {/* Secondary blobs - larger, softer, fill the gaps */}
          <FluidBlob color="#FF6EC4" startX="35%" startY="20%" delay={2.0}  duration={15} size={70} peakOpacity={0.42} />
          <FluidBlob color="#FFA56B" startX="65%" startY="80%" delay={4.0}  duration={16} size={68} peakOpacity={0.40} />
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

  return (
    <motion.div
      aria-hidden
      initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
      animate={
        reduced
          ? { x: 0, y: 0, scale: 1, opacity: peakOpacity * 0.85 }
          : {
              x: [0, 80, -40, 60, 0],
              y: [0, -60, 40, -20, 0],
              scale: [1, 1.18, 0.9, 1.12, 1],
              opacity: [0, peakOpacity, peakOpacity * 0.75, peakOpacity, 0],
            }
      }
      transition={
        reduced
          ? { duration: 0.4, ease: 'easeOut' }
          : { duration, delay, repeat: Infinity, ease: 'easeInOut' }
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
