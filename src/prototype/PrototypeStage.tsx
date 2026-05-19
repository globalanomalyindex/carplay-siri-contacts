import { useRef, useState } from 'react'
import { CarPlayChrome } from './chrome/CarPlayChrome'
import { DockSwitcher, type DockSurface } from './chrome/DockSwitcher'
import { ScreenEdgeAura } from './chrome/ScreenEdgeAura'
import { ScreenEdgeAuraRim } from './chrome/ScreenEdgeAuraRim'
import { MasterOrb } from './MasterOrb/MasterOrb'
import { OrbControlProvider } from './MasterOrb/OrbControlProvider'
import { useOrbControl } from './MasterOrb/OrbControlContext'
import { useGlobalSiriDismiss } from './MasterOrb/useGlobalSiriDismiss'
import { useSwipeOffScreenAbort } from './MasterOrb/useSwipeOffScreenAbort'
import { MagnifierProvider } from './Magnifier'
import { useLongPressRotarySession } from './Magnifier/useLongPressRotarySession'
import { useAccessibilitySettings } from '../a11y/useAccessibilitySettings'
import { SettingsProvider } from '../a11y/SettingsContext'
import { ReducedMotionOverrideProvider } from '../a11y/ReducedMotionOverrideProvider'
import { ToastProvider } from './Toast'
import { AriaLockAnnouncer } from '../a11y/AriaLockAnnouncer'
import { useAriaLabelMap } from '../a11y/useAriaLabelMap'
import { DebugPanel } from './DebugPanel'
import { DrivingProvider } from './phone/DrivingContext'
import { PhoneApp } from './phone/PhoneApp'
import { MapsSketch } from './surfaces/MapsSketch'
import { MusicSketch } from './surfaces/MusicSketch'

export interface PrototypeStageProps {
  /** When true, renders the floating debug panel for parked/driving + a11y overrides. */
  showDebugPanel?: boolean
}

/**
 * Reusable composition of the CarPlay prototype. Renders the 720x400 screen
 * with the rainbow edge bloom, the chrome (orb + dock), and the current
 * surface (phone, maps, music). Used both standalone at /prototype and
 * embedded inside the case study page.
 */
export function PrototypeStage({ showDebugPanel = false }: PrototypeStageProps) {
  const { settings, update } = useAccessibilitySettings()
  const [driving, setDriving] = useState(false)
  const [surface, setSurface] = useState<DockSurface>('phone')
  const screenRef = useRef<HTMLDivElement>(null)

  return (
    <ReducedMotionOverrideProvider value={settings.forceReducedMotion}>
      <SettingsProvider value={settings}>
        <ToastProvider>
          <OrbControlProvider>
            <MagnifierProvider>
              <AnnouncerShell />
              <ShellWiring screenRef={screenRef} />
              <div
                ref={screenRef}
                data-testid="carplay-screen-bounds"
                style={{ width: 720, height: 400, position: 'relative' }}
              >
                {/* Aura sits BEHIND the chrome so the rainbow bloom can
                    bleed past the rounded edge into the surrounding tray
                    without tinting the screen interior. */}
                <ScreenEdgeAuraGate />
                <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
                  <CarPlayChrome
                    orbHome={<MasterOrb />}
                    dock={<DockSwitcher surface={surface} onSelect={setSurface} />}
                  >
                    <DrivingProvider driving={driving}>
                      {surface === 'phone' && <PhoneApp />}
                      {surface === 'maps'  && <MapsSketch />}
                      {surface === 'music' && <MusicSketch />}
                    </DrivingProvider>
                  </CarPlayChrome>
                </div>
                {/* Rim overlay sits on top of the chrome so the inset glow
                    and white edge highlight catch the actual rounded corner. */}
                <ScreenEdgeAuraRimGate />
              </div>
            </MagnifierProvider>
          </OrbControlProvider>
        </ToastProvider>
      </SettingsProvider>
      {showDebugPanel && (
        <DebugPanel
          settings={settings}
          update={update}
          driving={driving}
          setDriving={setDriving}
        />
      )}
    </ReducedMotionOverrideProvider>
  )
}

/**
 * Co-locates the window-level hooks that need MagnifierProvider + OrbControl
 * context. Global Siri dismiss listens for taps outside the orb when Siri is
 * active. Swipe-off-screen aborts rotary if the pointer leaves the CarPlay
 * screen bounds. The long-press rotary session forwards window pointer events
 * to the magnifier driver once the orb's drag-from-orb path starts.
 *
 * There is no global "long-press anywhere" listener: each cell that opts in
 * (via ExpandableCell) owns its own hold recognition. The only entry into
 * the rotary magnifier is the orb's drag gesture.
 */
function ShellWiring({ screenRef }: { screenRef: React.RefObject<HTMLDivElement | null> }) {
  useLongPressRotarySession()
  useGlobalSiriDismiss()
  useSwipeOffScreenAbort({ screenRef })
  return null
}

function ScreenEdgeAuraGate() {
  const { siriActive } = useOrbControl()
  return <ScreenEdgeAura active={siriActive} />
}

function ScreenEdgeAuraRimGate() {
  const { siriActive } = useOrbControl()
  return <ScreenEdgeAuraRim active={siriActive} />
}

function AnnouncerShell() {
  const labels = useAriaLabelMap()
  return <AriaLockAnnouncer labels={labels} />
}
