import { motion } from 'motion/react'
import { PastelText } from '../components/PastelText'
import { PullQuote } from '../components/PullQuote'
import { SectionLabel } from '../components/SectionLabel'

/**
 * The friction. Frames the problem with the current CarPlay
 * Phone Contacts tab: it's locked while driving and only offers "Ask Siri,"
 * which is redundant since the user could ask Siri from any state. Includes
 * an annotated reproduction of that screen and the anonymized customer-
 * service validation insight.
 */
export function Friction() {
  return (
    <section className="cs-section" id="friction">
      <div className="cs-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <SectionLabel stop="pink">01 &middot; The friction</SectionLabel>
          <h2 className="cs-h2">
            The Contacts tab is a sign that points back to itself.
          </h2>
          <p className="cs-body">
            CarPlay's Phone app renders three tabs while parked: Favorites,
            Recents, Contacts. In driving state, the Contacts tab stays
            visible. Its body locks. The only interactive element it offers
            is a button labeled <em>Ask Siri to Make a Call</em>.
          </p>
          <p className="cs-body">
            The user has already navigated to a tab that exists only to direct
            them to a feature they could have used from any other tab, or by
            pressing the steering-wheel Siri button, or by saying "Hey Siri."
            Two motor actions and three cognitive checks deliver no value.
            Any attention spent here is attention diverted from the road.
          </p>
        </motion.div>

        {/* Annotated reproduction of the current CarPlay screen */}
        <motion.figure
          style={{ margin: '64px auto 0', maxWidth: 760, position: 'relative' }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <div className="friction-screen">
            <div className="friction-screen-inner">
              <div className="friction-dock">
                <div className="friction-dock-icon active">P</div>
                <div className="friction-dock-icon">M</div>
                <div className="friction-dock-icon">A</div>
                <div className="friction-dock-icon">N</div>
              </div>
              <div className="friction-app">
                <div className="friction-tabs">
                  <div className="friction-tab">Favorites</div>
                  <div className="friction-tab">Recents</div>
                  <div className="friction-tab active locked">Contacts</div>
                </div>
                <div className="friction-locked-body">
                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.55)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Contacts is limited while driving.
                  </div>
                  <div className="siri-btn">Ask Siri to Make a Call</div>
                </div>
              </div>
            </div>
          </div>

          {/* Annotation pins */}
          <div
            className="friction-pin"
            style={{ left: 40, top: -14 }}
          >
            <div className="friction-pin-dot" style={{ background: 'var(--pastel-pink)' }} />
            <div className="friction-pin-text">Locked tab</div>
          </div>
          <div
            className="friction-pin"
            style={{ right: 40, top: 90 }}
          >
            <div className="friction-pin-dot" style={{ background: 'var(--pastel-sky)' }} />
            <div className="friction-pin-text">Redundant action</div>
          </div>

          <figcaption
            style={{
              fontSize: 13,
              color: 'var(--cs-text-2)',
              marginTop: 18,
              textAlign: 'center',
            }}
          >
            The CarPlay Phone Contacts tab while driving, reproduced from the current iOS implementation.
          </figcaption>
        </motion.figure>

        <PullQuote>
          A tab that signposts to a feature the user could have used
          from <PastelText variant="lavender">any other state</PastelText> is attention spent on nothing.
        </PullQuote>

        {/* Customer service validation callout */}
        <motion.aside
          className="cs-card-tinted"
          style={{ marginTop: 64, maxWidth: 760, marginInline: 'auto' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--cs-text-2)',
              marginBottom: 12,
            }}
          >
            Research insight
          </div>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: 'var(--cs-text)' }}>
            Customer-service representatives at a major US broadband and TV
            provider report routine calls from customers with motor conditions
            who lean on iOS AssistiveTouch on their phones. In CarPlay, those
            affordances are largely absent. The recurring outcome: drivers
            wait until they can pull over to do anything that needs
            precision. This case study addresses the gap directly.
          </p>
        </motion.aside>
      </div>
    </section>
  )
}
