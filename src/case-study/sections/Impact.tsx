import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { SectionLabel } from '../components/SectionLabel'
import { SpecTable } from '../components/SpecTable'
import { Counter } from '../components/Counter'
import { AsciiArrow } from '../components/AsciiArrow'

/**
 * Impact and validation. KPIs, a hypothetical research plan, and a two-phase
 * rollout outline. The numbers anchor the design in falsifiable claims.
 */
export function Impact() {
  return (
    <section className="cs-section" id="impact" style={{ background: 'var(--cs-bg-tint)' }}>
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <AsciiArrow length={5} />
          <SectionLabel stop="mint">08 &middot; impact</SectionLabel>
          <h2 className="cs-h2">
            <PastelText variant="gradient-1">measurable</PastelText> on day one.
          </h2>
          <p className="cs-body">
            every claim in this design is set up to be tested. the KPIs below
            are baselines and targets, and the hypothesis sheet behind them
            lists stop-ship criteria. if the prototype shipped at Apple, this
            is how the team would know it worked.
          </p>
        </motion.div>

        {/* Headline stats */}
        <div className="cs-grid cs-grid-4" style={{ marginTop: 64 }}>
          <motion.div
            className="cs-stat"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="cs-stat-value">
              <Counter value={20} suffix="M+" />
            </div>
            <div className="cs-stat-label">
              US adults with significant motor impairment, counted once across
              overlapping conditions. the direct beneficiaries.
            </div>
          </motion.div>
          <motion.div
            className="cs-stat"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <div className="cs-stat-value">
              <Counter value={230} suffix="M" />
            </div>
            <div className="cs-stat-label">
              US licensed drivers. curb-cut beneficiaries of the same affordances.
            </div>
          </motion.div>
          <motion.div
            className="cs-stat"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            <div className="cs-stat-value">
              <Counter value={40} suffix="%" />
            </div>
            <div className="cs-stat-label">
              predicted drop in mis-actions on bumpy roads. hypothesis H3.
            </div>
          </motion.div>
          <motion.div
            className="cs-stat"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            <div className="cs-stat-value">
              <Counter value={85} suffix="%" />
            </div>
            <div className="cs-stat-label">
              target first-try task completion for motor-constrained users. baseline 45%.
            </div>
          </motion.div>
        </div>

        {/* KPI tables */}
        <div className="cs-grid cs-grid-2" style={{ marginTop: 72, gap: 48 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="cs-h3">primary KPIs</h3>
            <SpecTable
              rows={[
                { label: 'Eyes-off-road time per task',  value: '3.4s -> <= 2.5s' },
                { label: 'Time-to-call from home',       value: '6.8s -> <= 4.5s' },
                { label: 'Motor task completion rate',   value: '45% -> >= 85%' },
                { label: 'Mis-action rate',              value: '8.2% -> <= 3%' },
                { label: 'Subjective fatigue (Borg-CR10)', value: '4.2 -> <= 3.2' },
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <h3 className="cs-h3">latency targets</h3>
            <SpecTable
              rows={[
                { label: 'Tap-to-visual (orb)',         value: '<= 100ms' },
                { label: 'Magnifier follow (drag)',     value: '<= 50ms' },
                { label: 'Cold-start to interactive',   value: '<= 400ms' },
                { label: 'Frame rate (gesture)',        value: '60fps' },
                { label: 'Reduce Motion path',          value: 'crossfade swap' },
              ]}
            />
          </motion.div>
        </div>

        {/* Rollout */}
        <motion.div
          style={{ marginTop: 80 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="cs-h3">phased rollout</h3>
          <div className="cs-grid cs-grid-2">
            <div className="cs-card">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--cs-text-2)',
                  marginBottom: 12,
                }}
              >
                phase 1 &middot; phone deep build
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: 0, color: 'var(--cs-text)' }}>
                master orb ships as system chrome. the Phone app adopts the
                magnifier first. the contacts tab disappears from the driving
                state instead of redirecting. a radial dialer replaces the
                keypad in parked-only state. opt-in for general users, default-on
                for paired-iPhone AssistiveTouch users.
              </p>
            </div>
            <div className="cs-card">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--cs-text-2)',
                  marginBottom: 12,
                }}
              >
                phase 2 &middot; system-wide
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: 0, color: 'var(--cs-text)' }}>
                Maps adopts the magnifier for point-of-interest pins and the
                quick-controls strip. Music adopts it for queue selection and
                scrub-bar drift. the third-party API <code className="spec-value">CPMagnifiableTarget</code> ships
                at the following WWDC. the cellular widget-grid layout kicks off
                as the second case study in the series.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
