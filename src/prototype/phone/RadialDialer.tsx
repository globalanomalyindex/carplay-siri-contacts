import { useState } from 'react'
import { MagnifiableFrame } from '../Magnifier'
import { useDriving } from './useDriving'

const DIGITS_IN_RING: { d: string; angleDeg: number }[] = [
  { d: '3', angleDeg:  90 },
  { d: '4', angleDeg: 130 },
  { d: '5', angleDeg: 170 },
  { d: '6', angleDeg: 210 },
  { d: '7', angleDeg: 250 },
  { d: '8', angleDeg: 290 },
  { d: '9', angleDeg: 330 },
  { d: '0', angleDeg:  10 },
  { d: '1', angleDeg:  50 },
  { d: '2', angleDeg:  70 },
]

const RING_RADIUS = 70
const DIGIT_DIAM = 38

export function RadialDialer() {
  const driving = useDriving()
  const [readout, setReadout] = useState('')

  if (driving) {
    return (
      <div
        data-testid="dialer-disabled-notice"
        className="h-full flex flex-col items-center justify-center"
        style={{ color: 'var(--text-tertiary)', fontSize: 12 }}
      >
        <div>Keypad unavailable while driving.</div>
        <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>Ask Siri.</div>
      </div>
    )
  }

  const append = (d: string) => setReadout((r) => (r + d).slice(0, 14))
  const back = () => setReadout((r) => r.slice(0, -1))

  return (
    <div className="h-full flex items-center justify-center">
      <div style={{
        position: 'relative',
        width: RING_RADIUS * 2 + DIGIT_DIAM,
        height: RING_RADIUS * 2 + DIGIT_DIAM,
      }}>
        {DIGITS_IN_RING.map((dig, i) => {
          const rad = (dig.angleDeg * Math.PI) / 180
          const x = RING_RADIUS + Math.cos(rad) * RING_RADIUS
          const y = RING_RADIUS + Math.sin(rad) * RING_RADIUS
          return (
            <div
              key={dig.d}
              style={{
                position: 'absolute',
                left: x, top: y, transform: 'translate(-50%, -50%)',
              }}
            >
              <MagnifiableFrame
                id={`dial-${dig.d}`}
                index={i}
                onCommit={() => append(dig.d)}
                label={`Digit ${dig.d}`}
              >
                <button
                  data-testid={`dialer-digit-${dig.d}`}
                  onClick={() => append(dig.d)}
                  style={{
                    width: DIGIT_DIAM, height: DIGIT_DIAM,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {dig.d}
                </button>
              </MagnifiableFrame>
            </div>
          )
        })}
        <div style={{
          position: 'absolute',
          left: RING_RADIUS + DIGIT_DIAM / 2,
          top: RING_RADIUS + DIGIT_DIAM / 2,
          transform: 'translate(-50%, -50%)',
          width: 80,
          textAlign: 'center',
        }}>
          <div
            data-testid="dialer-readout"
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              color: 'rgba(180,230,250,0.95)',
              letterSpacing: '0.1em',
              minHeight: 18,
              marginBottom: 6,
            }}
          >
            {readout}
          </div>
          <MagnifiableFrame
            id="dial-backspace"
            index={11}
            onCommit={back}
            label="Backspace"
          >
            <button
              data-testid="dialer-backspace"
              onClick={back}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {'<'}
            </button>
          </MagnifiableFrame>
        </div>
      </div>
    </div>
  )
}
