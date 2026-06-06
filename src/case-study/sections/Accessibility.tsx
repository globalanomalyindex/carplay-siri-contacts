import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { PullQuote } from '../components/PullQuote'
import { SectionLabel } from '../components/SectionLabel'

interface Beneficiary {
  group: string
  prevalence: string
  constraint: string
  response: string
  accent: string
}

const BENEFICIARIES: Beneficiary[] = [
  {
    group: "Parkinson's disease",
    prevalence: '~1M US adults',
    constraint: '3-6Hz resting tremor and rigidity reduce precise tap timing.',
    response: 'Magnifier averages tremor across the gesture. Only the lift point matters; no tap-timing window.',
    accent: 'var(--pastel-pink)',
  },
  {
    group: 'Essential tremor',
    prevalence: '~10M US adults',
    constraint: 'Action tremor amplifies when reaching for small targets.',
    response: '40pt lock radius. Land within range; shake can continue without breaking the lock.',
    accent: 'var(--pastel-peach)',
  },
  {
    group: 'Arthritis, low precision',
    prevalence: '~58M US adults',
    constraint: 'Joint pain on repeated precise actuations; sustained hover is costly.',
    response: 'Fixed orb location (zero hunt). Screen-as-anchor means the arm rests. A predicted ~50% drop in joint actuations to place a call.',
    accent: 'var(--pastel-yellow)',
  },
  {
    group: 'Post-stroke, MS, low dexterity',
    prevalence: '~8M US adults',
    constraint: 'Limited finger isolation; pinch and spread are out of reach.',
    response: 'Single-finger drag is the only required input. Region-mirrored layout for RHD vehicles.',
    accent: 'var(--pastel-mint)',
  },
  {
    group: 'One-handed users',
    prevalence: 'Situational',
    constraint: 'Holding a child, a coffee, a phone. A broken arm. Cold gloved hands.',
    response: 'Every action is a single drag. No two-handed gesture exists. Glove input works as long as capacitance triggers.',
    accent: 'var(--pastel-sky)',
  },
  {
    group: 'Drivers, generally',
    prevalence: '~230M US adults',
    constraint: 'Bumpy roads, fatigue, distraction, glare, cold hands, unfamiliar rental cars.',
    response: 'The same primitive serves every one of those. Curb-cut effect: design for the margin, lift everyone.',
    accent: 'var(--pastel-lavender)',
  },
]

interface AxisRecap {
  axis: string
  example: string
}

const AXIS_EXAMPLES: AxisRecap[] = [
  {
    axis: "Fitts' Law",
    example: 'Orb sits in the same chrome cell across every app. Locating it is reflex, not perception.',
  },
  {
    axis: 'Jitter tolerance',
    example:
      'Drift, snap radius, and cell-membrane hysteresis compound. A bump on the road does not transfer to the lock.',
  },
  {
    axis: 'Fatigue (arm anchor)',
    example:
      'The finger lives on the screen for the whole gesture. The screen is the rest. Lift commits in one motion.',
  },
]

/**
 * Accessibility. The strategic centerpiece. States the
 * accessibility-led framing and lays out the beneficiary populations,
 * the curb-cut effect, and how each of the three axes plays out.
 */
export function Accessibility() {
  return (
    <section className="cs-section" id="accessibility">
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <SectionLabel>04 &middot; Accessibility</SectionLabel>
          <h2 className="cs-h2">
            Designed for the most motor-constrained user.
            <br />
            <PastelText variant="gradient-1">Everyone</PastelText> gets the same affordance.
          </h2>
          <p className="cs-body">
            CarPlay's accessibility surface today is materially thinner than
            iOS's. There is no AssistiveTouch equivalent. The most
            safety-critical entry point in the Phone app is buried behind a
            locked tab. Users who rely on AssistiveTouch on their iPhone
            arrive in the car without it. This redesign reverses that.
          </p>
          <p className="cs-body">
            Each population below sees the same orb. The same gesture grammar.
            The same magnifier. The accessibility path is not a mode toggle.
            It is the default behavior of the system.
          </p>
          <p className="cs-body">
            Framed plainly, this is capability, not accommodation. A driver who
            could not reliably place a call while the car was moving gets that
            control back, unassisted. The measure that matters is not seconds
            saved or screens avoided. It is first-try completion, and the target
            is to carry motor-constrained drivers from a 45 percent baseline to
            85 percent.
          </p>
          <p className="cs-body">
            Holding a cell expands it inline rather than opening a separate
            menu. Neighbors shift to make room. Nothing disappears. That
            matters for users who navigate by spatial memory, who lose their
            place when content reshuffles, or who cannot recover from a screen
            that suddenly looks unfamiliar. The action chips appear right where
            the user is already looking, attached to the cell that produced
            them.
          </p>
        </motion.div>

        {/* Beneficiary grid */}
        <div className="cs-grid cs-grid-3" style={{ marginTop: 64 }}>
          {BENEFICIARIES.map((b, i) => (
            <motion.div
              key={b.group}
              className="cs-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.06, 0.3) }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: b.accent,
                  marginBottom: 18,
                }}
                aria-hidden="true"
              />
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  margin: '0 0 4px',
                  letterSpacing: '-0.01em',
                }}
              >
                {b.group}
              </h3>
              <div
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace',
                  fontSize: 11,
                  color: 'var(--cs-text-2)',
                  marginBottom: 14,
                  letterSpacing: '-0.01em',
                }}
              >
                {b.prevalence}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--cs-text-2)',
                  margin: '0 0 14px',
                  lineHeight: 1.55,
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--cs-rule)',
                }}
              >
                {b.constraint}
              </p>
              <p style={{ fontSize: 14, color: 'var(--cs-text)', margin: 0, lineHeight: 1.55 }}>
                {b.response}
              </p>
            </motion.div>
          ))}
        </div>

        <PullQuote cite="The principle, by name">
          The <PastelText variant="gradient-2">curb-cut effect</PastelText>: build the ramp for wheelchairs,
          and the strollers, the bikes, and the rolling luggage benefit too.
        </PullQuote>

        {/* Three-axis recap */}
        <motion.div
          style={{ marginTop: 24 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <h3 className="cs-h3" style={{ marginBottom: 24 }}>
            Three ergonomic axes, one primitive.
          </h3>
          <div className="cs-grid cs-grid-3">
            {AXIS_EXAMPLES.map((a, i) => (
              <div
                key={a.axis}
                style={{
                  paddingTop: 18,
                  borderTop: '2px solid var(--cs-text)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--cs-text-2)',
                    marginBottom: 10,
                  }}
                >
                  Axis 0{i + 1}
                </div>
                <h4
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    margin: '0 0 12px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {a.axis}
                </h4>
                <p style={{ fontSize: 14, color: 'var(--cs-text-2)', margin: 0, lineHeight: 1.55 }}>
                  {a.example}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
