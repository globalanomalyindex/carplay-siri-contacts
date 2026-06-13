import { motion } from 'motion/react'
import { useRef } from 'react'
import { Counter } from '../components/Counter'
import { AsciiArrow } from '../components/AsciiArrow'
import { MetricBadge } from '../components/MetricBadge'
import { EXPERIMENT_RESULTS } from '../data/experimentResults'

/**
 * Hero. Brutalist and lowercase. The one bit of color is the ASCII arrow that
 * fills rainbow one character at a time; everything else is ink on paper. No
 * ambient gradient, no competing object, just the claim and the numbers.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)

  // The mis-commit stat is the one measured number in the hero, read from the
  // generated experiment data so it can never drift from what the runner found.
  const tab = EXPERIMENT_RESULTS.cells.find(
    (c) => c.scenarioId === 'tab-contest' && c.tierId === 'essential',
  )
  const simDropPts = tab ? Math.round(tab.absoluteRiskReduction * 100) : 0

  return (
    <header ref={ref} className="cs-section cs-hero" style={{ paddingTop: 96 }}>
      <div className="cs-container">
        <motion.div
          className="cs-hero-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <AsciiArrow length={7} />
          <p className="cs-mono-label" style={{ margin: 0 }}>
            CarPlay redesign &middot; designed + built by Christopher Robin Fiore
          </p>
        </motion.div>

        <motion.h1
          className="cs-h1"
          style={{ marginTop: 32, maxWidth: 880 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.2, 0.8, 0.3, 1.0], delay: 0.06 }}
        >
          one master affordance.
        </motion.h1>

        <motion.p
          className="cs-lead"
          style={{ marginTop: 28, maxWidth: 660 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.3, 1.0], delay: 0.18 }}
        >
          a new interaction primitive for CarPlay, built in real code (it's right
          below, go poke at it). one orb that is both a Siri trigger and a
          tremor-tolerant magnifier, so the whole car interface stays reachable
          for the people who need it most.
        </motion.p>

        <motion.div
          className="cs-hero-stats"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0], delay: 0.26 }}
        >
          <div className="cs-stat">
            <div className="cs-stat-value">
              <Counter value={45} suffix="%" />
              <span aria-hidden="true" className="cs-stat-arrow">-&gt;</span>
              <Counter value={85} suffix="%" />
            </div>
            <div className="cs-stat-label">target first-try completion, motor-constrained drivers</div>
          </div>
          <div className="cs-stat">
            <div className="cs-stat-value">
              <Counter value={simDropPts} suffix=" pts" />
            </div>
            <div className="cs-stat-label">
              simulated drop in first-try mis-commits, region gating on vs off
              <MetricBadge kind="measured" />
            </div>
          </div>
          <div className="cs-stat">
            <div className="cs-stat-value">
              <Counter value={20} suffix="M+" />
            </div>
            <div className="cs-stat-label">US adults with significant motor impairment, counted once</div>
          </div>
        </motion.div>

        <motion.div
          className="cs-hero-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span><strong>built by</strong> Christopher Robin Fiore, design engineer</span>
          <span><strong>read time</strong> 8 min</span>
          <span><strong>shipped</strong> may 2026</span>
        </motion.div>
      </div>
    </header>
  )
}
