import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { PullQuote } from '../components/PullQuote'
import { SectionLabel } from '../components/SectionLabel'

interface NatureCandidate {
  name: string
  trait: string
  outcome: string
  accent: 'pink' | 'peach' | 'yellow' | 'mint' | 'sky' | 'lavender'
}

const CANDIDATES: NatureCandidate[] = [
  {
    name: 'Mimosa pudica',
    trait: 'Folds on touch; reopens after delay',
    outcome: 'Modeled a fail-safe close. Too binary for continuous gestures.',
    accent: 'mint',
  },
  {
    name: 'Sea anemone',
    trait: 'Polyps reach toward stimulus, retract from danger',
    outcome: 'Captured directional attention but the kinetic vocabulary read as decorative, not functional.',
    accent: 'sky',
  },
  {
    name: 'Starling murmuration',
    trait: 'Thousands of birds, one body',
    outcome: 'Beautiful systems metaphor for collective interaction. Solo-driver context did not fit.',
    accent: 'lavender',
  },
  {
    name: 'Pinecone',
    trait: 'Hinged scales open and close with humidity',
    outcome: 'Early front-runner. Eventually replaced by water for continuous-gesture support.',
    accent: 'peach',
  },
]

/**
 * Section 3. Process. Walks through the four nature candidates and the
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
          <SectionLabel>02 &middot; Process</SectionLabel>
          <h2 className="cs-h2">
            Looking to <PastelText variant="gradient-2">nature</PastelText> for an anchor metaphor.
          </h2>
          <p className="cs-body">
            The brief asked for a single primitive that could absorb the
            most-jitter-vulnerable interaction class in a moving vehicle.
            Nature was a useful frame: living systems handle noise, motion,
            and uncertainty as a default condition. Four candidates were
            studied for their kinetic vocabulary.
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
                  height: 36,
                  borderRadius: 10,
                  background: `var(--pastel-${c.accent})`,
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
                  fontSize: 13.5,
                  color: 'var(--cs-text-2)',
                  margin: '0 0 14px',
                  lineHeight: 1.5,
                }}
              >
                {c.trait}
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--cs-text)', margin: 0, lineHeight: 1.5 }}>
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
          <h3 className="cs-h3">From hinge to flow.</h3>
          <p className="cs-body">
            Pinecone won the first round. The hinged scales mapped cleanly to
            an opening and closing affordance, calm and predictable. Once the
            design grew a gesture grammar (drag, drift, lock, lift) the hinge
            model started to bend. Pinecone modeled discrete state change.
            The gestures it had to carry were continuous.
          </p>
          <p className="cs-body">
            Water became the working metaphor. Water dampens jitter as a
            material property. Its surface tension matches the feel of a
            magnetic snap that resists casual disturbance. Apple's existing
            Liquid Glass language and Dynamic Island vocabulary already
            speak it. The same metaphor scales to dissipation: the orb
            dissolves and reforms like an eddy finding a new vessel.
          </p>
        </motion.div>

        <PullQuote cite="The curb-cut effect">
          Design for the most motor-constrained user.
          <br />
          <PastelText variant="gradient-1">Everyone else benefits.</PastelText>
        </PullQuote>
      </div>
    </section>
  )
}
