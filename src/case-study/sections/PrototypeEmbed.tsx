import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { PastelText } from '../components/PastelText'
import { SectionLabel } from '../components/SectionLabel'
import { PrototypeStage } from '../../prototype/PrototypeStage'

const HINTS: { title: string; body: string }[] = [
  { title: 'Tap the orb', body: 'Activates Siri. Tap again or swipe down to cancel.' },
  { title: 'Drag from the orb', body: 'Enters magnifier mode. Glass frames materialize around every discrete component.' },
  { title: 'Long-press anywhere', body: 'Same magnifier, but rescues a misfired tap in place. Layered over tap, never replaces it.' },
  { title: 'Long-press a contact', body: 'Opens the contextual quick-action menu (call / text / favorite).' },
  { title: 'Swipe a row', body: 'Right calls, left opens a text. Indicators slide in from the screen edges.' },
  { title: 'Use the dock', body: 'Switch surfaces from the left rail. Phone, Maps, and Music are all magnifier-aware.' },
]

/**
 * Section 5. The prototype itself, embedded. The CarPlay 720x400 screen
 * is rendered inline, surrounded by hint chips below.
 */
export function PrototypeEmbed() {
  return (
    <section className="cs-section" id="prototype">
      <div className="cs-container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
          style={{ textAlign: 'center', maxWidth: 720, marginInline: 'auto' }}
        >
          <SectionLabel>04 &middot; Try it</SectionLabel>
          <h2 className="cs-h2" style={{ marginInline: 'auto' }}>
            <PastelText variant="gradient-2">The prototype.</PastelText>
          </h2>
          <p className="cs-body" style={{ marginInline: 'auto' }}>
            Everything in this case study lives in the screen below. Pointer
            input is supported on desktop, touch on iOS or iPadOS. The orb,
            the magnifier, the cell-membrane hysteresis, the rainbow aura,
            the long-press rescue path. Try them.
          </p>
        </motion.div>

        <motion.div
          style={{
            marginTop: 64,
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
          }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          {/* Soft pastel pad behind the prototype frame */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-32px -32px -32px -32px',
              background: 'radial-gradient(closest-side at 30% 40%, var(--pastel-sky), transparent 70%), radial-gradient(closest-side at 70% 60%, var(--pastel-mint), transparent 70%)',
              opacity: 0.45,
              filter: 'blur(40px)',
              borderRadius: 32,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              padding: 24,
              background: '#0E1419',
              borderRadius: 28,
              boxShadow:
                '0 40px 80px -28px rgba(15, 23, 42, 0.45), 0 4px 12px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <PrototypeStage />
          </div>
        </motion.div>

        {/* Hint chips */}
        <div className="cs-grid cs-grid-3" style={{ marginTop: 64 }}>
          {HINTS.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              style={{
                padding: '18px 20px',
                borderRadius: 14,
                background: '#FFFFFF',
                border: '1px solid var(--cs-rule)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--cs-text-2)',
                  marginBottom: 6,
                }}
              >
                Gesture {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{h.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--cs-text-2)', lineHeight: 1.5 }}>{h.body}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link
            to="/prototype"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              borderRadius: 999,
              border: '1px solid var(--cs-rule)',
              color: 'var(--cs-text)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              background: '#FFFFFF',
            }}
          >
            Open the prototype in its own window
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
