import { useState } from 'react'
import { CarPlayChrome } from './prototype/chrome/CarPlayChrome'
import { MasterOrb } from './prototype/MasterOrb/MasterOrb'
import { MagnifierProvider, useMagnifierDriver } from './prototype/Magnifier'
import { useLongPressAnywhere } from './prototype/Magnifier/useLongPressAnywhere'
import { useLongPressRotarySession } from './prototype/Magnifier/useLongPressRotarySession'
import { useAccessibilitySettings } from './a11y/useAccessibilitySettings'
import { SettingsProvider } from './a11y/SettingsContext'
import { ReducedMotionOverrideProvider } from './a11y/ReducedMotionOverrideProvider'
import { AriaLockAnnouncer } from './a11y/AriaLockAnnouncer'
import { useAriaLabelMap } from './a11y/useAriaLabelMap'
import { DebugPanel } from './prototype/DebugPanel'
import { DrivingProvider } from './prototype/phone/DrivingContext'
import { PhoneApp } from './prototype/phone/PhoneApp'
import { RadialDialer } from './prototype/phone/RadialDialer'
import { MapsSketch } from './prototype/surfaces/MapsSketch'
import { MusicSketch } from './prototype/surfaces/MusicSketch'

type Surface = 'phone' | 'dialer' | 'maps' | 'music'

function App() {
  const { settings, update } = useAccessibilitySettings()
  const [driving, setDriving] = useState(false)
  const [surface, setSurface] = useState<Surface>('phone')

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <ReducedMotionOverrideProvider value={settings.forceReducedMotion}>
        <SettingsProvider value={settings}>
          <MagnifierProvider>
            <AnnouncerShell />
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
                    {surface === 'phone'  && <PhoneApp />}
                    {surface === 'dialer' && <RadialDialer />}
                    {surface === 'maps'   && <MapsSketch />}
                    {surface === 'music'  && <MusicSketch />}
                  </DrivingProvider>
                </CarPlayChrome>
              </div>
            </LongPressRescueShell>
          </MagnifierProvider>
        </SettingsProvider>
      </ReducedMotionOverrideProvider>
      <DebugPanel
        settings={settings}
        update={update}
        driving={driving}
        setDriving={setDriving}
        surface={surface}
        setSurface={setSurface}
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

function AnnouncerShell() {
  const labels = useAriaLabelMap()
  return <AriaLockAnnouncer labels={labels} />
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
