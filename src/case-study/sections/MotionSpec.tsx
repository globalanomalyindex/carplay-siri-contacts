import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { SectionLabel } from '../components/SectionLabel'
import { SpecTable } from '../components/SpecTable'
import { EasingCurveDemo } from '../components/EasingCurveDemo'
import { easing, dur } from '../../tokens/motion'

interface Curve {
  token: string
  bezier: [number, number, number, number]
  use: string
}

const CURVES: Curve[] = [
  {
    token: '--ease-liquid-out',
    bezier: easing.liquidOut,
    use: 'Dissipation outgoing. Particles disperse fast then drift outward.',
  },
  {
    token: '--ease-liquid-in',
    bezier: easing.liquidIn,
    use: 'Reform incoming. Particles gather slowly then lock at home.',
  },
  {
    token: '--ease-magnify-lock',
    bezier: easing.magnifyLock,
    use: 'Target magnification on drift-over. Snappy commit feel.',
  },
  {
    token: '--ease-ambient-breathe',
    bezier: easing.ambientBreathe,
    use: 'Idle orb breathing loop. +/-5% scale, 6s cycle.',
  },
  {
    token: '--ease-snap-fire',
    bezier: easing.snapFire,
    use: 'Commit flash on lift. Tight onset, soft fall.',
  },
  {
    token: '--ease-frame-emerge',
    bezier: easing.frameEmerge,
    use: 'Glass-frame hitboxes materializing around discrete components.',
  },
  {
    token: '--ease-aura-travel',
    bezier: easing.auraTravel,
    use: 'Locked-cell aura crossing from one component to its neighbor.',
  },
  {
    token: '--ease-cell-membrane',
    bezier: easing.cellMembrane,
    use: 'Hysteresis resistance. Slight inertia before the lock transitions.',
  },
]

/**
 * Section 7. Motion spec. The most "tech-spec" looking section. Named
 * curves with live demos, durations, and the performance budget. Built to
 * resemble Apple developer documentation more than a portfolio page.
 */
export function MotionSpec() {
  return (
    <section className="cs-section" id="motion" style={{ background: 'var(--cs-bg-tint)' }}>
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <SectionLabel>06 &middot; Motion spec</SectionLabel>
          <h2 className="cs-h2">
            Eight named curves. <PastelText variant="gradient-2">One feel.</PastelText>
          </h2>
          <p className="cs-body">
            Every animation in the prototype references a named easing token,
            never a magic number. The same curve that pulls particles back to
            the orb also lights the locked cell. The result reads as one
            material in motion across the whole system.
          </p>
        </motion.div>

        {/* Curve grid */}
        <div className="cs-grid cs-grid-4" style={{ marginTop: 56 }}>
          {CURVES.map((c, i) => (
            <motion.div
              key={c.token}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3) }}
            >
              <EasingCurveDemo token={c.token} bezier={c.bezier} use={c.use} />
            </motion.div>
          ))}
        </div>

        {/* Durations + performance budget */}
        <div className="cs-grid cs-grid-2" style={{ marginTop: 72, gap: 48 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
          >
            <h3 className="cs-h3">Duration tokens</h3>
            <SpecTable
              rows={[
                { label: 'dur-dissipate',           value: `${dur.dissipate * 1000}ms` },
                { label: 'dur-reform',              value: `${dur.reform * 1000}ms` },
                { label: 'dur-magnify',             value: `${dur.magnify * 1000}ms` },
                { label: 'dur-flash',               value: `${dur.flash * 1000}ms` },
                { label: 'dur-frame-emerge',        value: `${dur.frameEmerge * 1000}ms` },
                { label: 'dur-aura-travel',         value: `${dur.auraTravel * 1000}ms` },
                { label: 'dur-long-press-threshold', value: `${dur.longPressThreshold * 1000}ms` },
                { label: 'dur-aura-cycle',          value: `${dur.auraCycle}s` },
                { label: 'dur-ambient-breathe',     value: `${dur.ambientBreathe}s` },
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
          >
            <h3 className="cs-h3">Performance budget</h3>
            <SpecTable
              rows={[
                { label: 'Frame rate',          value: '60fps gesture / 30fps idle' },
                { label: 'Touch-to-visual',     value: '<= 100ms orb / <= 50ms magnifier' },
                { label: 'Backdrop blur layers', value: '1 (no stacking)' },
                { label: 'Particles per dissipation', value: '<= 12 elements' },
                { label: 'Memory ceiling (orb)', value: '~8MB working set' },
                { label: 'Cold-start to interactive', value: '<= 400ms' },
                { label: 'Reduce Motion path',  value: 'crossfade + state swap' },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
