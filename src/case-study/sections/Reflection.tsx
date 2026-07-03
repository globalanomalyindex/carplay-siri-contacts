import { motion } from 'motion/react'
import { AsciiArrow } from '../components/AsciiArrow'
import { Emphasis } from '../components/Emphasis'
import { SectionLabel } from '../components/SectionLabel'

/**
 * Reflection. Honest about what worked, what would change
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
          <AsciiArrow length={5} />
          <SectionLabel>09 &middot; reflection</SectionLabel>
          <h2 className="cs-h2">
            what <Emphasis>worked</Emphasis>. what i would push further.
          </h2>
        </motion.div>

        <div className="cs-grid cs-grid-2" style={{ marginTop: 56, gap: 40 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="cs-h3">what worked</h3>
            <p className="cs-body">
              picking accessibility as the strategic frame did more work
              than picking aesthetics ever would. once the design was sized
              for the most motor-constrained driver, every secondary decision
              fell out cleanly: the magnifier, the cell-membrane hysteresis,
              the long-press-anywhere rescue path, the dock as a magnifier
              surface. the brief stayed honest because the constraint stayed
              honest.
            </p>
            <p className="cs-body">
              the pivot from pinecone to water was the second strongest call.
              forcing the metaphor to live in motion instead of decoration kept
              the visual surface clean and close to Apple HIG. the water feel
              is entirely in the curves.
            </p>
            <p className="cs-body">
              framing the win as capability gained, not harm avoided, kept the
              whole project pointed at one measurable outcome: whether a driver
              who could not place a call while moving can now do it on the first
              try.
            </p>
            <p className="cs-body">
              the same test eventually caught this document. early drafts made
              the reader work for the payoff, which is the exact failure the
              Contacts tab makes a driver sit through. so the hero now leads
              with the outcome, a short version gives a skimmer an exit after
              four rows, and measured numbers wear badges so they cannot be
              mistaken for targets.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <h3 className="cs-h3">what i would push</h3>
            <p className="cs-body">
              this covers Phone deeply, and Maps and Music as sketches. with
              more time, a Maps deep build would let me test the
              snap-to-component vs free-drift handoff under real navigation
              pressure. Music's queue selection deserves a proper test pass
              with eyes-off-road telemetry too.
            </p>
            <p className="cs-body">
              i'd also prototype a passenger-side variant. the current design
              declines that path on purpose, since the driver and passenger
              share the same input surface. zonal touch detection might
              eventually make a passenger mode safe, but that's a research
              question, not a design question.
            </p>
            <p className="cs-body">
              the part i am most curious to push is the intent layer. right now
              the magnifier works out what you meant from geometry alone: snap
              to a component on discrete UI, free-drift on a continuous canvas.
              that same question, what did the driver actually intend, is exactly
              where a model takes over once geometry runs out. say "call the
              office one" over a list of three offices, and the gesture stops
              being the thing that has to be precise. the affordance stays the
              same. what resolves the target gets smarter, and the accessibility
              win compounds.
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
          <div className="cs-kicker">next in the series</div>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 600,
              margin: '0 0 12px',
              letterSpacing: '-0.015em',
            }}
          >
            cellular CarPlay: a customizable widget-grid layout.
          </h3>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--cs-text-2)', lineHeight: 1.55 }}>
            the master orb is the foundation that makes the customizable grid
            safe to drive. composing a CarPlay home screen from cells of
            varying sizes (now playing, navigation mini, contacts mini) is the
            next case study.
          </p>
        </motion.aside>
      </div>
    </section>
  )
}
