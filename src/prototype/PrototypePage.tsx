import { Link } from 'react-router-dom'
import { PrototypeStage } from './PrototypeStage'

/**
 * Standalone prototype route at /prototype. Presents the CarPlay screen as a
 * demo a cold visitor can understand: a title, a one-line framing, a gesture
 * legend, and the first-run ring that points at the orb. The screen sits on a
 * brand-tinted vignette rather than a flat slate so it reads as a staged
 * artifact, not a debug harness.
 */
const GESTURES: { g: string; r: string }[] = [
  { g: 'Tap the orb', r: 'Wake Siri' },
  { g: 'Drag the orb', r: 'Magnify any control' },
  { g: 'Hold a row', r: 'Call / Text in place' },
  { g: 'Swipe a row', r: 'Right calls, left texts' },
]

export function PrototypePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        color: '#fff',
        // Brand-tinted vignette: a deep blue-green wash toward the CarPlay
        // palette, never flat black or generic slate.
        background:
          'radial-gradient(1100px 620px at 50% -6%, #182a33 0%, #0d171d 52%, #070c10 100%)',
      }}
    >
      <header style={{ textAlign: 'center', maxWidth: 640 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(125, 225, 255, 0.9)',
          }}
        >
          Interactive prototype
        </div>
        <h1
          style={{
            margin: '12px 0 0',
            fontSize: 'clamp(30px, 5vw, 50px)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          One Master Affordance
        </h1>
        <p
          style={{
            margin: '16px auto 0',
            maxWidth: 540,
            fontSize: 15.5,
            lineHeight: 1.55,
            color: 'rgba(255, 255, 255, 0.62)',
          }}
        >
          An accessibility-led CarPlay gesture system. Drag the orb to magnify
          any control and lift on the one you want; tap it for Siri. Built for
          the most motor-constrained driver first.
        </p>
      </header>

      {/* Framed screen */}
      <div style={{ position: 'relative', marginTop: 44 }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -44,
            background:
              'radial-gradient(closest-side at 30% 35%, rgba(125, 170, 255, 0.20), transparent 70%), radial-gradient(closest-side at 74% 70%, rgba(120, 255, 210, 0.14), transparent 70%)',
            filter: 'blur(52px)',
            borderRadius: 44,
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
            border: '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow:
              '0 50px 90px -30px rgba(0, 0, 0, 0.7), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <PrototypeStage showDebugPanel showCoach />
        </div>
      </div>

      {/* Gesture legend */}
      <ul
        style={{
          listStyle: 'none',
          margin: '36px 0 0',
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {GESTURES.map((item) => (
          <li
            key={item.g}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'rgba(125, 225, 255, 0.9)',
                boxShadow: '0 0 8px rgba(125, 225, 255, 0.6)',
                flexShrink: 0,
              }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.g}</span>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>{item.r}</span>
            </span>
          </li>
        ))}
      </ul>

      <Link
        to="/"
        style={{
          marginTop: 32,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 20px',
          borderRadius: 999,
          border: '1px solid rgba(255, 255, 255, 0.14)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Read the full case study
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  )
}
