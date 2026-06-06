import { Link } from 'react-router-dom'

/**
 * footer. build credit, date, links to the repo and the standalone
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
            one master affordance
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
            case study, may 2026
          </div>
        </div>

        <div className="cs-footer-meta">
          <div>
            <div style={{ marginBottom: 6, color: 'var(--cs-text-3)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              designed + built by
            </div>
            <div style={{ color: 'var(--cs-text)' }}>Christopher Robin Fiore</div>
            <div style={{ color: 'var(--cs-text-2)', fontSize: 13, marginTop: 2 }}>design engineer</div>
          </div>
          <div>
            <div style={{ marginBottom: 6, color: 'var(--cs-text-3)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              stack
            </div>
            <div style={{ color: 'var(--cs-text)' }}>
              React 19 &middot; TypeScript &middot; Motion &middot; XState &middot; Vite &middot; Tailwind 4
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/prototype">open the prototype</Link>
            <a
              href="https://github.com/globalanomalyindex/carplay-siri-contacts"
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
          independent portfolio work. not affiliated with or endorsed by Apple Inc.
          CarPlay is a trademark of Apple Inc.
        </p>
      </div>
    </footer>
  )
}
