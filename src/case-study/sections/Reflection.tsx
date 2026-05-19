import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { SectionLabel } from '../components/SectionLabel'

/**
 * Section 10. Reflection. Honest about what worked, what would change
 * with more time, and what's next in the series.
 */
export function Reflection() {
  return (
    <section className="cs-section" id="reflection">
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <SectionLabel>09 &middot; Reflection</SectionLabel>
          <h2 className="cs-h2">
            What <PastelText variant="gradient-2">worked</PastelText>. What I would push further.
          </h2>
        </motion.div>

        <div className="cs-grid cs-grid-2" style={{ marginTop: 56, gap: 40 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="cs-h3">What worked</h3>
            <p className="cs-body">
              Picking accessibility as the strategic frame did more work
              than picking aesthetics. Once the design was sized for the
              most motor-constrained user, every secondary decision fell
              out cleanly: the magnifier, the cell-membrane hysteresis,
              the long-press-anywhere rescue path, the dock as a magnifier
              surface. The brief stayed honest because the constraint stayed
              honest.
            </p>
            <p className="cs-body">
              The pivot from pinecone to water was the second strongest
              decision. Forcing the metaphor to live in motion rather than
              decoration kept the visual surface clean Apple HIG. The water
              feel is entirely in the curves.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <h3 className="cs-h3">What I would push</h3>
            <p className="cs-body">
              The case study covers Phone deeply and Maps and Music as
              sketches. With more time, a Maps deep build would let me test
              the snap-to-component vs free-drift handoff under real
              navigation pressure. Music's queue selection deserves a
              proper test pass with eyes-off-road telemetry too.
            </p>
            <p className="cs-body">
              I would also prototype a passenger-side variant. The current
              design declines that path on purpose (the driver and passenger
              share the same input surface). Zonal touch detection might
              eventually make a passenger mode safe; that's a research
              question, not a design question.
            </p>
          </motion.div>
        </div>

        <motion.aside
          className="cs-card"
          style={{ marginTop: 64, maxWidth: 720, marginInline: 'auto', textAlign: 'center' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--cs-text-2)',
              marginBottom: 14,
            }}
          >
            Next in the series
          </div>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 600,
              margin: '0 0 12px',
              letterSpacing: '-0.015em',
            }}
          >
            Cellular CarPlay: a customizable widget-grid layout.
          </h3>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--cs-text-2)', lineHeight: 1.55 }}>
            The Master Orb is the foundation that makes the customizable grid
            safe to drive. Composing a CarPlay home screen from cells of
            varying sizes &mdash; Now Playing, navigation mini, contacts mini
            &mdash; is the next case study.
          </p>
        </motion.aside>
      </div>
    </section>
  )
}
