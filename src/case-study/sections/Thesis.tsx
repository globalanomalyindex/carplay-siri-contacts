import { motion } from 'motion/react'
import { AsciiArrow } from '../components/AsciiArrow'
import { Emphasis } from '../components/Emphasis'
import { SectionLabel } from '../components/SectionLabel'

interface Axis {
  name: string
  problem: string
  response: string
}

const AXES: Axis[] = [
  {
    name: "Fitts' Law",
    problem: 'targets are far, small, or dropped wherever the layout felt like putting them.',
    response:
      'the orb lives in one fixed system-level spot above the dock. always there, always reachable. no hunting for it.',
  },
  {
    name: 'jitter tolerance',
    problem: 'road vibration and tremor turn precise taps into mis-taps.',
    response:
      'sustained gestures average the noise out across a path. a 40pt magnetic radius and 60% hysteresis hold the lock through small bumps.',
  },
  {
    name: 'fatigue (arm anchor)',
    problem: 'hover-and-tap makes the arm hold itself up for every single action.',
    response:
      'drag-and-lift keeps the finger on the screen for the whole gesture, so the screen does the holding. one decisive lift commits.',
  },
]

/**
 * Thesis. States the one-master-affordance idea in plain
 * language and lays out the three-axis ergonomic frame. Grayscale
 * plus the ASCII arrow; no pastel halo, no rainbow orb disc.
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
          <AsciiArrow length={5} />
          <SectionLabel>02 &middot; thesis</SectionLabel>
          <h2 className="cs-h2">
            one persistent orb.
            <br />
            <Emphasis>every Phone interaction</Emphasis> today. the system tomorrow.
          </h2>
          <p className="cs-body">
            one system-level affordance in the top-left negative space above
            the dock. tap it to call Siri. drag it to enter a context-aware
            magnifier that snaps to discrete components and free-drifts over
            continuous canvases. hold a cell directly and it expands inline,
            surfacing its actions next to the content already there.
            cell-membrane hysteresis keeps the lock honest. a driver learns
            one gesture grammar instead of a screen full of controls.
          </p>
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
                    width: 14,
                    height: 1,
                    background: 'var(--cs-text)',
                  }}
                />
                axis 0{i + 1}
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
                  fontSize: 'var(--text-sm)',
                  color: 'var(--cs-text-2)',
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--cs-rule)',
                }}
              >
                {axis.problem}
              </p>
              <p style={{ fontSize: 'var(--text-sm-plus)', color: 'var(--cs-text)', margin: 0, lineHeight: 1.55 }}>
                {axis.response}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
