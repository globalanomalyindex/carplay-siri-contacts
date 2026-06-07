import { motion } from 'motion/react'
import { AsciiArrow } from '../components/AsciiArrow'
import { Emphasis } from '../components/Emphasis'
import { PullQuote } from '../components/PullQuote'
import { SectionLabel } from '../components/SectionLabel'

interface NatureCandidate {
  name: string
  trait: string
  outcome: string
}

const CANDIDATES: NatureCandidate[] = [
  {
    name: 'Mimosa pudica',
    trait: 'folds on touch, reopens after a delay',
    outcome: 'modeled a fail-safe close. too binary for continuous gestures.',
  },
  {
    name: 'Sea anemone',
    trait: 'polyps reach toward stimulus, retract from danger',
    outcome: 'caught directional attention, but the kinetic vocabulary read as decorative, not functional.',
  },
  {
    name: 'Starling murmuration',
    trait: 'thousands of birds, one body',
    outcome: 'a lovely systems metaphor for collective interaction. solo-driver context did not fit.',
  },
  {
    name: 'Pinecone',
    trait: 'hinged scales open and close with humidity',
    outcome: 'early front-runner. eventually swapped for water once i needed continuous-gesture support.',
  },
]

/**
 * process. walks through the four nature candidates and the
 * pivot from pinecone to water once the gesture-first principle landed.
 */
export function Process() {
  return (
    <section className="cs-section" id="process">
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <AsciiArrow length={5} />
          <SectionLabel>07 &middot; process</SectionLabel>
          <h2 className="cs-h2">
            i went looking at <Emphasis>nature</Emphasis> for an anchor metaphor.
          </h2>
          <p className="cs-body">
            the brief needed a single primitive that could absorb the
            most-jitter-vulnerable interaction class in a moving car.
            nature was a useful frame: living systems treat noise, motion,
            and uncertainty as the default condition, not the exception. i
            studied four candidates for their kinetic vocabulary.
          </p>
        </motion.div>

        <div className="cs-grid cs-grid-4" style={{ marginTop: 56 }}>
          {CANDIDATES.map((c, i) => (
            <motion.div
              key={c.name}
              className="cs-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.2, 0.8, 0.3, 1.0] }}
            >
              <div
                style={{
                  width: 36,
                  height: 1,
                  background: 'var(--cs-text)',
                  marginBottom: 16,
                }}
                aria-hidden="true"
              />
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  margin: '0 0 6px',
                  letterSpacing: '-0.01em',
                }}
              >
                {c.name}
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--cs-text-2)',
                  margin: '0 0 14px',
                  lineHeight: 1.5,
                }}
              >
                {c.trait}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text)', margin: 0, lineHeight: 1.5 }}>
                {c.outcome}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{ marginTop: 80 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <h3 className="cs-h3">from hinge to flow.</h3>
          <p className="cs-body">
            pinecone won the first round. the hinged scales mapped cleanly to
            an opening and closing affordance, calm and predictable. then the
            design grew a gesture grammar (drag, drift, lock, lift) and the
            hinge model started to bend. pinecone modeled discrete state change.
            the gestures it had to carry were continuous.
          </p>
          <p className="cs-body">
            so water became the working metaphor. water dampens jitter as a
            material property. its surface tension matches the feel of a
            magnetic snap that resists a casual nudge. Apple's existing
            Liquid Glass language and Dynamic Island vocabulary already
            speak it. the same metaphor scales to dissipation: the orb
            dissolves and reforms like an eddy finding a new vessel.
          </p>
        </motion.div>

        <motion.div
          style={{ marginTop: 64 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <h3 className="cs-h3">iterating on the contextual menu.</h3>
          <p className="cs-body">
            an early version of the hold-to-act path put four action chips in
            the cardinal directions around the touch point: call up, text down,
            and so on. it read well in isolation but broke spatial continuity.
            the chips floated as a separate constellation, cut off from the
            row that produced them. drivers had to re-acquire the affordance
            visually instead of feeling it grow from where their finger already
            sat.
          </p>
          <p className="cs-body">
            the current model expands the cell in place. the row grows, its
            actions show up alongside the existing content, and the rows above
            and below shift to make room. nothing disappears. the visual map of
            the screen survives the whole gesture, which matters most for the
            users who can least afford to lose it.
          </p>
        </motion.div>

        <PullQuote cite="the pivot, in one line">
          the pinecone modeled a door.
          <br />
          the gestures it had to carry needed <Emphasis>water</Emphasis>.
        </PullQuote>
      </div>
    </section>
  )
}
