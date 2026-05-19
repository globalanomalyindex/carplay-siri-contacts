import { useRef } from 'react'
import { MagnifiableFrame, useMagnifiable } from '../Magnifier'
import { useToast } from '../useToast'

const QUICK_CONTROLS = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'gas',  label: 'Gas' },
  { id: 'food', label: 'Food' },
]

const POIS = [
  { id: 'starbucks', x: 30, y: 40, label: 'Starbucks' },
  { id: 'shell',     x: 65, y: 60, label: 'Shell' },
  { id: 'whole',     x: 50, y: 75, label: 'Whole Foods' },
]

export function MapsSketch() {
  const toast = useToast()
  return (
    <div
      data-testid="maps-sketch"
      className="flex flex-col gap-2 p-2"
      style={{ height: '100%', minHeight: 0 }}
    >
      <div className="flex gap-2 flex-shrink-0">
        {QUICK_CONTROLS.map((qc, i) => (
          <MagnifiableFrame
            key={qc.id}
            id={`maps-qc-${qc.id}`}
            index={i}
            onCommit={() => toast.show(`Routing to ${qc.label}`)}
            label={`Quick control: ${qc.label}`}
          >
            <button
              data-variant="quick-control"
              data-state="idle"
              style={{
                padding: '8px 14px',
                minHeight: 32,
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.92)',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.10)',
              }}
            >
              {qc.label}
            </button>
          </MagnifiableFrame>
        ))}
      </div>
      <MapCanvas />
    </div>
  )
}

function MapCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  useMagnifiable({
    id: 'map-canvas',
    ref: canvasRef,
    behavior: 'freeDrift',
    onCommit: (p) => toast.show(`Drop pin at (${Math.round(p?.x ?? 0)}, ${Math.round(p?.y ?? 0)})`),
    label: 'Map canvas: drop a pin',
  })

  return (
    <div
      ref={canvasRef}
      data-testid="map-canvas"
      style={{
        flex: '1 1 0',
        minHeight: 0,
        width: '100%',
        position: 'relative',
        background:
          'radial-gradient(circle at 30% 25%, rgba(120, 220, 240, 0.18), transparent 55%),' +
          'radial-gradient(circle at 75% 75%, rgba(180, 150, 255, 0.14), transparent 60%),' +
          'linear-gradient(180deg, #2d4a52 0%, #1f3a48 55%, #16293a 100%)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle map "roads": a curved primary road + crossing grid lines */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <path d="M 0 65 Q 30 50, 55 60 T 100 50" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" fill="none" />
          <path d="M 40 0 Q 50 35, 55 60 T 65 100" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" fill="none" />
          <line x1="0" y1="38" x2="100" y2="44" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="84" y2="100" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />
        </svg>
      </div>
      {POIS.map((p, i) => (
        <div
          key={p.id}
          style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <MagnifiableFrame
            id={`poi-${p.id}`}
            index={i + 10}
            onCommit={() => toast.show(`Selected POI: ${p.label}`)}
            label={p.label}
          >
            <div
              data-testid={`poi-pin-${p.id}`}
              data-variant="map-pin"
              style={{
                width: 22, height: 22, borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                background: 'var(--action-call)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.24)',
                border: '2px solid rgba(255,255,255,0.85)',
              }}
            />
          </MagnifiableFrame>
        </div>
      ))}
    </div>
  )
}
