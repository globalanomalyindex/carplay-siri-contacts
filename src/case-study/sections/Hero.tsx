import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { PastelText } from '../components/PastelText'
import { useReducedMotion } from '../../a11y/useReducedMotion'

/**
 * Hero. Full-bleed introduction. Massive title with a pastel-gradient
 * accent on "Master". The decorative orb floats behind the title and
 * parallaxes upward on scroll.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const orbY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -80])
  const orbScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 0.94])
  const orbOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.7])

  return (
    <header ref={ref} className="cs-section" style={{ paddingTop: 96, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orb floats to the right of the headline, never behind it */}
      <motion.div
        aria-hidden="true"
        className="hero-orb-anchor"
        style={{
          y: orbY,
          scale: orbScale,
          opacity: orbOpacity,
        }}
      >
        <motion.div
          className="hero-orb"
          animate={reduced ? undefined : { scale: [1, 1.04, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }}
        />
      </motion.div>

      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--cs-text-2)',
              margin: 0,
            }}
          >
            A CarPlay case study by Chris Fiore
          </p>
        </motion.div>

        <motion.h1
          className="cs-h1"
          style={{ marginTop: 36, position: 'relative', maxWidth: 720 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.2, 0.8, 0.3, 1.0], delay: 0.06 }}
        >
          One{' '}
          <PastelText variant="gradient-1">Master</PastelText>
          <br />
          Affordance.
        </motion.h1>

        <motion.p
          className="cs-lead"
          style={{ marginTop: 28, maxWidth: 720 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.3, 1.0], delay: 0.18 }}
        >
          Accessibility-led gesture design for CarPlay. A redesign that closes
          the gap between iOS AssistiveTouch and the car's center console with
          a single persistent affordance.
        </motion.p>

        <motion.div
          style={{
            marginTop: 56,
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
            fontSize: 13,
            color: 'var(--cs-text-2)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          <span><strong style={{ color: 'var(--cs-text)', fontWeight: 600 }}>Designer</strong> &nbsp; Chris Fiore</span>
          <span><strong style={{ color: 'var(--cs-text)', fontWeight: 600 }}>Reading time</strong> &nbsp; 8 min</span>
          <span><strong style={{ color: 'var(--cs-text)', fontWeight: 600 }}>Published</strong> &nbsp; May 2026</span>
        </motion.div>
      </div>
    </header>
  )
}
