import { useState } from 'react'
import { CarPlayChrome } from './prototype/chrome/CarPlayChrome'
import { MasterOrb } from './prototype/MasterOrb/MasterOrb'
import { MagnifierProvider, useMagnifierDriver } from './prototype/Magnifier'
import { useLongPressAnywhere } from './prototype/Magnifier/useLongPressAnywhere'
import { useLongPressRotarySession } from './prototype/Magnifier/useLongPressRotarySession'
import { useAccessibilitySettings } from './a11y/useAccessibilitySettings'
import { DebugPanel } from './prototype/DebugPanel'
import { DrivingProvider } from './prototype/phone/DrivingContext'
import { PhoneApp } from './prototype/phone/PhoneApp'

function App() {
  const { settings, update } = useAccessibilitySettings()
  const [driving, setDriving] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <MagnifierProvider>
        <LongPressRescueShell enabled={settings.longPressAnywhere}>
          <div style={{ width: 720, height: 400 }}>
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
              <DrivingProvider driving={driving}>
                <PhoneApp />
              </DrivingProvider>
            </CarPlayChrome>
          </div>
        </LongPressRescueShell>
      </MagnifierProvider>
      <DebugPanel
        settings={settings}
        update={update}
        driving={driving}
        setDriving={setDriving}
      />
    </div>
  )
}

function LongPressRescueShell({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const driver = useMagnifierDriver()
  useLongPressAnywhere({ enabled, onLongPress: () => driver.start() })
  useLongPressRotarySession()
  return <>{children}</>
}

function DockIcon({ label }: { label: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 9,
      background: 'rgba(255,255,255,0.10)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.70)', fontSize: 14,
    }}>{label}</div>
  )
}

export default App
