import { Link } from 'react-router-dom'

/**
 * Footer. Designer credit, date, links to repo and the standalone
 * prototype route.
 */
export function Footer() {
  return (
    <footer className="cs-footer">
      <div className="cs-footer-inner">
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em' }}>
            One Master Affordance
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--cs-text-2)',
            }}
          >
            Case study, May 2026
          </div>
        </div>

        <div className="cs-footer-meta">
          <div>
            <div style={{ marginBottom: 6, color: 'var(--cs-text-3)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Designer
            </div>
            <div style={{ color: 'var(--cs-text)' }}>Chris Fiore</div>
          </div>
          <div>
            <div style={{ marginBottom: 6, color: 'var(--cs-text-3)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Stack
            </div>
            <div style={{ color: 'var(--cs-text)' }}>
              React 19 &middot; TypeScript &middot; Motion &middot; XState &middot; Vite &middot; Tailwind 4
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/prototype">Open the prototype</Link>
            <a
              href="https://github.com/cgfiore/carplay-siri-contacts"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repo
            </a>
          </div>
        </div>

        <p
          style={{
            fontSize: 12,
            color: 'var(--cs-text-3)',
            marginTop: 16,
            maxWidth: 720,
          }}
        >
          Independent portfolio work. Not affiliated with or endorsed by Apple Inc.
          CarPlay is a trademark of Apple Inc.
        </p>
      </div>
    </footer>
  )
}
