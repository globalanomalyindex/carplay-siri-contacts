import { motion } from 'motion/react'
import { AsciiArrow } from '../components/AsciiArrow'
import { Emphasis } from '../components/Emphasis'
import { PullQuote } from '../components/PullQuote'
import { SectionLabel } from '../components/SectionLabel'

interface Beneficiary {
  group: string
  prevalence: string
  constraint: string
  response: string
}

const BENEFICIARIES: Beneficiary[] = [
  {
    group: "Parkinson's disease",
    prevalence: '~1M US adults',
    constraint: '3-6Hz resting tremor and rigidity make precise tap timing hard.',
    response: 'the magnifier averages the tremor out across the gesture. only the lift point matters, so there is no tap-timing window to miss.',
  },
  {
    group: 'essential tremor',
    prevalence: '~7M US adults',
    constraint: 'action tremor gets worse the moment you reach for a small target.',
    response: '40pt lock radius. land anywhere in range and the shake can keep going without breaking the lock.',
  },
  {
    group: 'arthritis, low precision',
    prevalence: '~53M US adults',
    constraint: 'joint pain on repeated precise actuations; holding a hover is expensive.',
    response: 'the orb sits in a fixed spot (zero hunt). screen-as-anchor lets the arm rest. a predicted ~50% drop in joint actuations to place a call.',
  },
  {
    group: 'post-stroke, MS, low dexterity',
    prevalence: '~8M US adults',
    constraint: 'limited finger isolation; pinch and spread are out of reach.',
    response: 'a single-finger drag is the only input the system asks for. layout mirrors for RHD vehicles.',
  },
  {
    group: 'one-handed users',
    prevalence: 'situational',
    constraint: 'holding a kid, a coffee, a phone. a broken arm. cold gloved hands.',
    response: 'every action is one drag. there is no two-handed gesture anywhere. gloves work fine as long as they trip capacitance.',
  },
  {
    group: 'drivers, generally',
    prevalence: '~233M US licensed drivers',
    constraint: 'bumpy roads, fatigue, distraction, glare, cold hands, an unfamiliar rental.',
    response: 'the same primitive covers all of it. curb-cut effect: design for the margin, lift everyone.',
  },
]

interface AxisRecap {
  axis: string
  example: string
}

const AXIS_EXAMPLES: AxisRecap[] = [
  {
    axis: "Fitts' Law",
    example: 'the orb sits in the same chrome cell across every app. finding it is reflex, not a thing you look for.',
  },
  {
    axis: 'jitter tolerance',
    example:
      'drift, snap radius, and cell-membrane hysteresis stack up. a bump in the road never reaches the lock.',
  },
  {
    axis: 'fatigue (arm anchor)',
    example:
      'the finger stays on the screen for the whole gesture. the screen is the armrest. lift commits in one motion.',
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
          <AsciiArrow length={5} />
          <SectionLabel>04 &middot; accessibility</SectionLabel>
          <h2 className="cs-statement">
            built for the most motor-constrained driver.
            <br />
            <Emphasis>everyone</Emphasis> gets the same affordance.
          </h2>
          <p className="cs-body">
            CarPlay's accessibility surface today is a lot thinner than iOS's.
            there is no AssistiveTouch equivalent. the most safety-critical
            thing in the Phone app is buried behind a locked tab, which is a
            little wild. people who lean on AssistiveTouch on their iPhone get
            in the car and it's just gone. this redesign hands it back.
          </p>
          <p className="cs-body">
            every population below sees the same orb. the same gesture grammar.
            the same magnifier. the accessibility path isn't a mode toggle you
            go hunting for, it's just how the system behaves by default.
          </p>
          <p className="cs-body">
            plainly: this is capability, not accommodation. a driver who
            couldn't reliably place a call while the car was moving gets that
            control back, on their own. the measure that matters isn't seconds
            saved or screens avoided. it's first-try completion.
          </p>
          <p className="cs-body">
            holding a cell expands it inline instead of opening a separate menu.
            the neighbors shift to make room. nothing disappears. that matters
            for people who work by spatial memory, who lose their place when
            content reshuffles, or who can't recover from a screen that suddenly
            looks unfamiliar. the action chips show up right where the eye
            already is, attached to the cell that produced them.
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
                  width: 24,
                  height: 1,
                  background: 'var(--cs-text)',
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
                  fontFamily: 'var(--cs-font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--cs-text-2)',
                  marginBottom: 14,
                  letterSpacing: '-0.01em',
                }}
              >
                {b.prevalence}
              </div>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--cs-text-2)',
                  margin: '0 0 14px',
                  lineHeight: 1.55,
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--cs-rule)',
                }}
              >
                {b.constraint}
              </p>
              <p style={{ fontSize: 'var(--text-sm-plus)', color: 'var(--cs-text)', margin: 0, lineHeight: 1.55 }}>
                {b.response}
              </p>
            </motion.div>
          ))}
        </div>

        <PullQuote cite="the principle, by name">
          the <Emphasis>curb-cut effect</Emphasis>: build the ramp for wheelchairs,
          and the strollers, the bikes, and the rolling luggage get it for free.
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
            three ergonomic axes, one primitive.
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
                <div className="cs-kicker" style={{ marginBottom: 10 }}>axis 0{i + 1}</div>
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
                <p style={{ fontSize: 'var(--text-sm-plus)', color: 'var(--cs-text-2)', margin: 0, lineHeight: 1.55 }}>
                  {a.example}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Keyboard + screen-reader path */}
        <motion.div
          style={{ marginTop: 48 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <h3 className="cs-h3">the same gesture, without the pointer.</h3>
          <p className="cs-body">
            every magnifiable control is a real focusable button. tab reaches
            it. enter or space fires the exact same commit a tap-lift fires, so
            a keyboard or switch-scanning user never hits a dead end. the
            expanded action chips that appear when you hold a contact follow the
            same rule: each chip has a tab stop and answers to enter and space.
            that matters for AssistiveTouch parity. someone who drives their
            iPhone through AssistiveTouch should not get in the car and find the
            interface is pointer-only. the keyboard path is the floor that keeps
            that from happening.
          </p>
          <p className="cs-body">
            the locked target is announced through a polite aria-live region, so
            a screen-reader user hears which control the lens is resting on as
            the magnifier moves. reduced motion is honored everywhere: the
            settle scale, the commit flash, and the lock haptic all suppress
            when the system preference is set. the keyboard path and the live-
            region announcement are built and tested in this prototype. full
            VoiceOver and Switch Control passes are specified for a real
            production build, not claimed here.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
