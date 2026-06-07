import { motion } from 'motion/react'
import { AsciiArrow } from '../components/AsciiArrow'
import { Emphasis } from '../components/Emphasis'
import { SectionLabel } from '../components/SectionLabel'

interface Gesture {
  name: string
  outcome: string
  threshold: string
  group: 'orb' | 'magnifier' | 'app'
}

const GESTURES: Gesture[] = [
  {
    name: 'Tap orb',
    outcome: 'Activate Siri. Tap again or swipe down to cancel.',
    threshold: '<= 250ms, < 8pt motion',
    group: 'orb',
  },
  {
    name: 'Swipe down on orb',
    outcome: 'Cancel an active Siri session. Bumpy-tolerant.',
    threshold: '>= 60pt downward',
    group: 'orb',
  },
  {
    name: 'Drag from orb',
    outcome:
      'Enter magnifier. Orb dissipates; glass-frame hitboxes materialize around every discrete component.',
    threshold: '>= 8pt motion',
    group: 'magnifier',
  },
  {
    name: 'Long-press cell',
    outcome:
      'Cell expands inline. Action chips appear alongside its existing content. Adjacent cells shift to make room; nothing disappears. Drift to a chip and lift to fire.',
    threshold: '>= 250ms hold, < 8pt motion',
    group: 'app',
  },
  {
    name: 'Drift across discrete UI',
    outcome:
      'Component under the fingertip becomes the locked cell. Aura travels with the lock, not the finger.',
    threshold: '40pt magnetic radius',
    group: 'magnifier',
  },
  {
    name: 'Cell-membrane hysteresis',
    outcome:
      'Lock holds until the finger crosses 60% past the next component\'s center. Small jitter does not bounce the lock.',
    threshold: '60% past neighbor center',
    group: 'magnifier',
  },
  {
    name: 'Drift across continuous canvas',
    outcome:
      'Free-drift magnifier. Whatever is under the fingertip magnifies. Used on map, scrub bar, photo.',
    threshold: '1.25x scale, 240ms',
    group: 'magnifier',
  },
  {
    name: 'Lift on locked component',
    outcome: 'Commit. Equivalent to a tap on that component. Aura fades, orb reforms at home.',
    threshold: 'On lift',
    group: 'magnifier',
  },
  {
    name: 'Lift on dead space',
    outcome: 'No action. Orb reforms at home. Safe "I changed my mind" path.',
    threshold: 'On lift, no lock',
    group: 'magnifier',
  },
  {
    name: 'Swipe right on row',
    outcome: 'Call. Green call indicator slides in from the left.',
    threshold: '>= 40pt horizontal',
    group: 'app',
  },
  {
    name: 'Swipe left on row',
    outcome: 'Open compose-text. Blue text indicator slides in from the right.',
    threshold: '>= 40pt horizontal',
    group: 'app',
  },
  {
    name: 'Horizontal swipe on tab pill',
    outcome: 'Switch tabs. Pill animates to next active position; content cross-fades.',
    threshold: '>= 60pt horizontal',
    group: 'app',
  },
]

const GROUP_LABELS: Record<Gesture['group'], { label: string }> = {
  orb:       { label: 'orb' },
  magnifier: { label: 'magnifier' },
  app:       { label: 'app' },
}

/**
 * Gesture grammar. Tech-spec table listing every gesture with
 * its outcome and recognition threshold. The mono pill on the left indicates
 * which layer of the system owns the gesture.
 */
export function GestureGrammar() {
  return (
    <section className="cs-section cs-section--dense" id="gestures">
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <AsciiArrow length={5} />
          <SectionLabel>05 &middot; gesture grammar</SectionLabel>
          <h2 className="cs-h2">
            <Emphasis>twelve gestures.</Emphasis> one vocabulary.
          </h2>
          <p className="cs-body">
            the orb owns two. the magnifier owns six. apps own four. every
            threshold is published, so adopters know exactly how much motion
            triggers what, and accessibility users can predict the system
            instead of guessing at it. and because every control opts in through
            one registration interface, the whole grammar could ship as a platform
            primitive that any CarPlay app picks up, not a one-off bolted onto this
            design.
          </p>
        </motion.div>

        <div
          style={{
            marginTop: 56,
            border: '1px solid var(--cs-text)',
            borderRadius: 0,
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 200px',
              padding: '16px 24px',
              borderBottom: '1px solid var(--cs-rule)',
              background: 'var(--cs-bg-tint)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--cs-text-2)',
            }}
          >
            <span>gesture</span>
            <span>outcome</span>
            <span style={{ textAlign: 'right' }}>threshold</span>
          </div>
          {GESTURES.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3) }}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 200px',
                padding: '20px 24px',
                borderBottom: i === GESTURES.length - 1 ? 0 : '1px solid var(--cs-rule)',
                alignItems: 'start',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '3px 10px',
                    background: 'transparent',
                    border: '1px solid var(--cs-text)',
                    borderRadius: 0,
                    fontSize: 'var(--text-2xs)',
                    fontWeight: 600,
                    color: 'var(--cs-text-2)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {GROUP_LABELS[g.group].label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>
                  {g.name}
                </span>
              </div>
              <span style={{ fontSize: 'var(--text-sm-plus)', lineHeight: 1.55, color: 'var(--cs-text)' }}>
                {g.outcome}
              </span>
              <code
                className="spec-value"
                style={{
                  textAlign: 'right',
                  justifySelf: 'end',
                  alignSelf: 'start',
                }}
              >
                {g.threshold}
              </code>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
