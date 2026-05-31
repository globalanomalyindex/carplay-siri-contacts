import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { PastelText } from '../components/PastelText'
import { useReducedMotion } from '../../a11y/useReducedMotion'

/**
 * Hero. Full-bleed introduction. Massive title with a pastel-gradient
 * accent on "Master". The rainbow lives as ambient atmosphere behind
 * the text (low-opacity blurred color blobs) plus a thin gradient bar
 * above the eyebrow line. No competing object on the right.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const auraY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -60])
  const auraOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.55])

  // Blob positions and motion paths form a soft rainbow that drifts
  // behind the headline. Positions stay inset from the section edges so
  // the soft falloff of each blob never clips against the section's
  // overflow boundary.
  const blobs = [
    {
      color: '#FF6E7F',
      x: ['22%', '28%', '18%', '24%', '22%'],
      y: ['22%', '16%', '28%', '20%', '22%'],
    },
    {
      color: '#FFD86B',
      x: ['72%', '66%', '78%', '70%', '72%'],
      y: ['20%', '28%', '22%', '14%', '20%'],
    },
    {
      color: '#6BFFD1',
      x: ['78%', '70%', '74%', '82%', '78%'],
      y: ['72%', '78%', '66%', '74%', '72%'],
    },
    {
      color: '#6B9AFF',
      x: ['24%', '20%', '30%', '22%', '24%'],
      y: ['74%', '68%', '78%', '72%', '74%'],
    },
    {
      color: '#B573FF',
      x: ['50%', '54%', '46%', '52%', '50%'],
      y: ['48%', '54%', '44%', '50%', '48%'],
    },
  ]

  return (
    <header ref={ref} className="cs-section" style={{ paddingTop: 96, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient rainbow atmosphere. Sits behind text, never competes. */}
      <motion.div
        aria-hidden="true"
        className="hero-aura"
        style={{ y: auraY, opacity: auraOpacity }}
      >
        {blobs.map((b, i) => (
          <motion.span
            key={i}
            className="hero-aura-blob"
            style={{ background: b.color }}
            initial={{ left: b.x[0], top: b.y[0], scale: 1 }}
            animate={
              reduced
                ? { left: b.x[0], top: b.y[0], scale: 1 }
                : {
                    left: b.x,
                    top: b.y,
                    scale: [1, 1.08, 0.96, 1.04, 1],
                  }
            }
            transition={{
              duration: 18 + i * 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.6,
            }}
          />
        ))}
      </motion.div>

      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
          style={{ display: 'flex', alignItems: 'center', gap: 14 }}
        >
          {/* Thin rainbow tech-spec bar */}
          <span aria-hidden="true" className="hero-spec-bar" />
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
            A CarPlay case study, designed + built by Christopher Robin Fiore
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
          <span><strong style={{ color: 'var(--cs-text)', fontWeight: 600 }}>Designed + built by</strong> &nbsp; Christopher Robin Fiore, Design Engineer</span>
          <span><strong style={{ color: 'var(--cs-text)', fontWeight: 600 }}>Reading time</strong> &nbsp; 8 min</span>
          <span><strong style={{ color: 'var(--cs-text)', fontWeight: 600 }}>Published</strong> &nbsp; May 2026</span>
        </motion.div>
      </div>
    </header>
  )
}
