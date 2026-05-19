import { motion, useReducedMotion as motionReduced } from 'motion/react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface EasingCurveDemoProps {
  token: string
  bezier: [number, number, number, number]
  use: string
  /** Loop duration in seconds (defaults to a generous 1.2s so the curve reads). */
  duration?: number
}

/**
 * Tech-spec card for a single named easing curve. Shows:
 *  - the token name in monospace
 *  - the cubic-bezier value in monospace
 *  - an SVG of the curve shape
 *  - a small puck demo that loops the curve so users can feel it
 *  - a one-line description of where the curve is used
 *
 * Honors reduced motion: the puck animates with a linear fade instead of the
 * curve so motion-sensitive users still see the demo but without the springy
 * traversal.
 */
export function EasingCurveDemo({
  token,
  bezier,
  use,
  duration = 1.4,
}: EasingCurveDemoProps) {
  const reduced = useReducedMotion()
  const reducedMotion = motionReduced()
  const skipMotion = reduced || reducedMotion

  // SVG curve path. Coordinate system: 0,0 top-left, 100x100 in viewBox.
  // Curve goes from bottom-left (0, 100) to top-right (100, 0) using
  // standard cubic bezier control points scaled from the bezier tuple.
  const [x1, y1, x2, y2] = bezier
  const cx1 = (x1 * 100).toFixed(2)
  const cy1 = (100 - y1 * 100).toFixed(2)
  const cx2 = (x2 * 100).toFixed(2)
  const cy2 = (100 - y2 * 100).toFixed(2)
  const path = `M 0 100 C ${cx1} ${cy1}, ${cx2} ${cy2}, 100 0`

  return (
    <div className="curve-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <span className="curve-card-token">{token}</span>
      </div>
      <span className="curve-card-value">
        cubic-bezier({bezier.map((v) => v.toFixed(2)).join(', ')})
      </span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {/* Axes */}
        <line x1="0" y1="100" x2="100" y2="100" stroke="var(--cs-rule)" strokeWidth="0.6" />
        <line x1="0" y1="0" x2="0" y2="100" stroke="var(--cs-rule)" strokeWidth="0.6" />
        {/* Curve */}
        <path d={path} fill="none" stroke="var(--cs-text)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {/* Endpoints */}
        <circle cx="0" cy="100" r="2" fill="var(--cs-text)" />
        <circle cx="100" cy="0" r="2" fill="var(--cs-text)" />
      </svg>
      <div className="curve-card-demo" aria-hidden="true">
        <motion.div
          className="puck"
          initial={{ left: '0%' }}
          animate={{ left: 'calc(100% - 22px)' }}
          transition={
            skipMotion
              ? { duration: 0, repeat: 0 }
              : {
                  duration,
                  ease: bezier,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }
          }
        />
      </div>
      <p className="curve-card-use">{use}</p>
    </div>
  )
}
