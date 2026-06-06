import { Link } from 'react-router-dom'
import './styles.css'
import { Hero } from './sections/Hero'
import { Friction } from './sections/Friction'
import { Process } from './sections/Process'
import { Thesis } from './sections/Thesis'
import { PrototypeEmbed } from './sections/PrototypeEmbed'
import { GestureGrammar } from './sections/GestureGrammar'
import { MotionSpec } from './sections/MotionSpec'
import { Accessibility } from './sections/Accessibility'
import { Impact } from './sections/Impact'
import { Reflection } from './sections/Reflection'
import { Footer } from './sections/Footer'

/**
 * Case study page at /. Composes the full long-form narrative around the
 * embedded interactive prototype. Light mode only for v1; dark mode is a
 * future enhancement.
 */
export function CaseStudyPage() {
  return (
    <div className="case-study">
      <a href="#main-content" className="cs-skip-link">skip to content</a>
      <nav className="cs-nav" aria-label="Case study navigation">
        <div className="cs-nav-inner">
          <span className="cs-nav-brand">one master affordance</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="#prototype" className="cs-nav-link">try it</a>
            <a href="#accessibility" className="cs-nav-link">accessibility</a>
            <a href="#motion" className="cs-nav-link">motion</a>
            <a href="#impact" className="cs-nav-link">outcomes</a>
            <Link to="/prototype" className="cs-nav-link">open prototype</Link>
          </div>
        </div>
      </nav>

      {/* Reading order leads with thesis and live proof, then the strategic
          accessibility frame, then the reference tables, with the generative
          process narrative after the payoff rather than before it. */}
      <main id="main-content">
        <Hero />
        <Friction />
        <Thesis />
        <PrototypeEmbed />
        <Accessibility />
        <GestureGrammar />
        <MotionSpec />
        <Process />
        <Impact />
        <Reflection />
      </main>

      <Footer />
    </div>
  )
}
