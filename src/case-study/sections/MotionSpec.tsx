import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
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
 * Motion spec. The most "tech-spec" looking section. Named
 * curves with live demos, durations, and the performance budget. Built to
 * resemble Apple developer documentation more than a portfolio page.
 */
export function MotionSpec() {
  return (
    <section className="cs-section cs-section--dense" id="motion" style={{ background: 'var(--cs-bg-tint)' }}>
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <SectionLabel stop="pink">06 &middot; Motion spec</SectionLabel>
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

        {/* Expandable-cell timing demo */}
        <motion.div
          style={{ marginTop: 72 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <h3 className="cs-h3">Expand-in-place timing</h3>
          <p className="cs-body" style={{ marginBottom: 24 }}>
            When a cell is held past the long-press threshold, it grows into
            its expanded state with a critically-damped spring (stiffness 280,
            damping 28, mass 0.5). Action chips fade and slide in via opacity
            plus a small transform offset. Total perceived motion lands at
            roughly 280ms, fast enough to feel responsive without feeling
            jumpy. Under Reduce Motion the expansion is instant and the chips
            fade over 120ms.
          </p>
          <ExpandableCellDemo />
        </motion.div>

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
                { label: 'dur-cell-expand',         value: 'spring 280/28/0.5' },
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

/**
 * Small interactive demo of the ExpandableCell expand-and-collapse motion.
 * A click toggles the cell between collapsed and expanded so visitors can
 * watch the spring without needing to engage the prototype. Reduced-motion
 * users get an instant swap.
 */
function ExpandableCellDemo() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  return (
    <div
      style={{
        background: 'var(--cs-bg)',
        padding: 24,
        borderRadius: 14,
        border: '1px solid var(--cs-rule)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cs-nav-link"
        style={{
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid var(--cs-rule)',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {open ? 'Collapse' : 'Hold to expand'}
      </button>
      <motion.div
        layout
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 280, damping: 28, mass: 0.5 }
        }
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 12,
          borderRadius: 12,
          background: 'linear-gradient(180deg, #1a3142, #2d4a52)',
          color: 'rgba(255,255,255,0.92)',
          width: open ? 360 : 220,
          boxShadow: open
            ? '0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)'
            : 'none',
          outline: open ? '1px solid rgba(120,220,240,0.35)' : '1px solid transparent',
        }}
      >
        <motion.div layout style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7fa3c4, #b8a3c4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
            }}
          >
            S
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Sarah</span>
        </motion.div>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0.12 }
                : { type: 'spring', stiffness: 320, damping: 28, mass: 0.5 }
            }
            style={{ display: 'flex', gap: 6 }}
          >
            <span
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--action-call)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Call
            </span>
            <span
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.92)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Text
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
