import { useRef } from 'react'
import { MagnifiableFrame, useMagnifiable } from '../Magnifier'

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
  return (
    <div className="h-full flex flex-col gap-2 p-2">
      <div className="flex gap-2">
        {QUICK_CONTROLS.map((qc, i) => (
          <MagnifiableFrame
            key={qc.id}
            id={`maps-qc-${qc.id}`}
            index={i}
            onCommit={() => alert(`Routing to ${qc.label}`)}
            label={`Quick control: ${qc.label}`}
          >
            <button
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.85)',
                borderRadius: 14,
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
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

  useMagnifiable({
    id: 'map-canvas',
    ref: canvasRef,
    behavior: 'freeDrift',
    onCommit: (p) => alert(`Drop pin at (${p?.x ?? 0}, ${p?.y ?? 0})`),
    label: 'Map canvas: drop a pin',
  })

  return (
    <div
      ref={canvasRef}
      data-testid="map-canvas"
      style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(180deg, #2d4a52, #1a3142)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.18)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '55%', width: 2, background: 'rgba(255,255,255,0.18)' }} />
      {POIS.map((p, i) => (
        <div
          key={p.id}
          style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <MagnifiableFrame
            id={`poi-${p.id}`}
            index={i + 10}
            onCommit={() => alert(`Selected POI: ${p.label}`)}
            label={p.label}
          >
            <div
              data-testid={`poi-pin-${p.id}`}
              style={{
                width: 22, height: 22, borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                background: 'var(--action-call)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.30)',
                border: '2px solid rgba(255,255,255,0.85)',
              }}
            />
          </MagnifiableFrame>
        </div>
      ))}
    </div>
  )
}
