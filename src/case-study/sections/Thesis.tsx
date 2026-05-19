import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { SectionLabel } from '../components/SectionLabel'

interface Axis {
  name: string
  problem: string
  response: string
  accent: 'pink' | 'mint' | 'sky'
}

const AXES: Axis[] = [
  {
    name: "Fitts' Law",
    problem: 'Targets are far, small, or unpredictably placed.',
    response:
      'The orb sits in a fixed system-level home above the dock. Always there, always reachable. No hunt cost.',
    accent: 'pink',
  },
  {
    name: 'Jitter tolerance',
    problem: 'Road vibration and tremor turn precise taps into mis-taps.',
    response:
      'Sustained gestures average noise across a path. A 40pt magnetic radius and 60% hysteresis hold the lock through small disturbances.',
    accent: 'mint',
  },
  {
    name: 'Fatigue (arm anchor)',
    problem: 'Hover-and-tap forces the arm to hold itself aloft for every action.',
    response:
      'Drag-and-lift keeps the finger on the screen for the duration of the gesture. The screen becomes a physical rest. One decisive lift commits.',
    accent: 'sky',
  },
]

/**
 * Section 4. Thesis. States the one-master-affordance idea in plain
 * language and lays out the three-axis ergonomic frame.
 */
export function Thesis() {
  return (
    <section className="cs-section" id="thesis" style={{ background: 'var(--cs-bg-tint)' }}>
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <SectionLabel>03 &middot; Thesis</SectionLabel>
          <h2 className="cs-h2">
            One persistent orb.
            <br />
            <PastelText variant="gradient-1">Every interaction</PastelText> the car needs.
          </h2>
          <p className="cs-body">
            A system-level affordance in the top-left negative space above
            the dock. Tap to invoke Siri. Drag to enter a context-aware
            magnifier mode that snaps to discrete components and free-drifts
            over continuous canvases. Hold a cell directly and it expands
            inline, surfacing its actions alongside its existing content.
            Cell-membrane hysteresis keeps the lock honest. The orb is the
            only thing a driver needs to learn.
          </p>
        </motion.div>

        {/* Hero orb visual with soft pastel halo */}
        <motion.div
          style={{
            margin: '64px auto',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            paddingBlock: 48,
          }}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(closest-side, var(--pastel-mint), transparent 60%), radial-gradient(closest-side, var(--pastel-sky) 0%, transparent 70%)',
              opacity: 0.7,
              filter: 'blur(40px)',
            }}
          />
          <div className="hero-orb" style={{ width: 220, height: 220 }} />
        </motion.div>

        {/* Three-axis grid */}
        <div className="cs-grid cs-grid-3" style={{ marginTop: 64 }}>
          {AXES.map((axis, i) => (
            <motion.div
              key={axis.name}
              className="cs-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.2, 0.8, 0.3, 1.0] }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--cs-text-2)',
                  marginBottom: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: `var(--pastel-${axis.accent})`,
                  }}
                />
                Axis 0{i + 1}
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  margin: '0 0 12px',
                  letterSpacing: '-0.015em',
                }}
              >
                {axis.name}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--cs-text-2)',
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--cs-rule)',
                }}
              >
                {axis.problem}
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--cs-text)', margin: 0, lineHeight: 1.55 }}>
                {axis.response}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
