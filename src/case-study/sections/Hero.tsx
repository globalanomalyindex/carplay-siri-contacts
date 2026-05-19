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

  // Blob positions and colors form a soft rainbow framing the headline.
  // Heavy blur + low opacity keeps text fully legible.
  const blobs = [
    { color: '#FF6E7F', left: '8%',  top: '18%' },
    { color: '#FFD86B', left: '78%', top: '14%' },
    { color: '#6BFFD1', left: '90%', top: '70%' },
    { color: '#6B9AFF', left: '12%', top: '78%' },
    { color: '#B573FF', left: '50%', top: '50%' },
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
            style={{ background: b.color, left: b.left, top: b.top }}
            animate={
              reduced
                ? undefined
                : {
                    x: [0, 24, -16, 0],
                    y: [0, -18, 12, 0],
                    scale: [1, 1.12, 0.94, 1],
                  }
            }
            transition={{
              duration: 11 + i * 0.9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.45,
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
