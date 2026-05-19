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
      <nav className="cs-nav" aria-label="Case study navigation">
        <div className="cs-nav-inner">
          <span className="cs-nav-brand">One Master Affordance</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="#prototype" className="cs-nav-link">Try it</a>
            <a href="#motion" className="cs-nav-link">Motion</a>
            <a href="#accessibility" className="cs-nav-link">Accessibility</a>
            <Link to="/prototype" className="cs-nav-link">Open prototype</Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Friction />
        <Process />
        <Thesis />
        <PrototypeEmbed />
        <GestureGrammar />
        <MotionSpec />
        <Accessibility />
        <Impact />
        <Reflection />
      </main>

      <Footer />
    </div>
  )
}
