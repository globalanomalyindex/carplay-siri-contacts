import { CarPlayChrome } from './prototype/chrome/CarPlayChrome'
import { MasterOrb } from './prototype/MasterOrb/MasterOrb'
import { MagnifierProvider, MagnifiableFrame } from './prototype/Magnifier'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <MagnifierProvider>
        <div style={{ width: 640, height: 360 }}>
          <CarPlayChrome
            orbHome={<MasterOrb />}
            dock={
              <>
                <DockIcon label="M" />
                <DockIcon label="N" />
                <DockIcon label="T" />
                <DockIcon label="S" />
              </>
            }
          >
            <div className="p-4 space-y-2 text-white/85 text-sm">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                Drag from the orb to test magnifier:
              </p>
              {['Mom', 'Dad', 'Sarah', 'Jake', 'Kira'].map((name, i) => (
                <MagnifiableFrame
                  key={name}
                  id={`fav-${name.toLowerCase()}`}
                  index={i}
                  onCommit={() => alert(`Calling ${name}`)}
                  label={`Call ${name}`}
                >
                  <div className="px-3 py-2">{name}</div>
                </MagnifiableFrame>
              ))}
            </div>
          </CarPlayChrome>
        </div>
      </MagnifierProvider>
    </div>
  )
}

function DockIcon({ label }: { label: string }) {
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: 9,
        background: 'rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.70)', fontSize: 14,
      }}
    >
      {label}
    </div>
  )
}

export default App
