import { CarPlayChrome } from './prototype/chrome/CarPlayChrome'
import { MasterOrb } from './prototype/MasterOrb/MasterOrb'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
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
          <div className="text-white/40 text-center pt-8 text-xs uppercase tracking-widest">
            (any app content)
          </div>
        </CarPlayChrome>
      </div>
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
