import { useRef, useState } from 'react'
import { CarPlayChrome } from './chrome/CarPlayChrome'
import { DockSwitcher, type DockSurface } from './chrome/DockSwitcher'
import { ScreenEdgeAura } from './chrome/ScreenEdgeAura'
import { ScreenEdgeAuraRim } from './chrome/ScreenEdgeAuraRim'
import { LiquidLens } from './chrome/LiquidLens'
import { MasterOrb } from './MasterOrb/MasterOrb'
import { OrbControlProvider } from './MasterOrb/OrbControlProvider'
import { useOrbControl } from './MasterOrb/OrbControlContext'
import { useGlobalSiriDismiss } from './MasterOrb/useGlobalSiriDismiss'
import { useSwipeOffScreenAbort } from './MasterOrb/useSwipeOffScreenAbort'
import { MagnifierProvider } from './Magnifier'
import { MagnifierSessionProvider } from './Magnifier/MagnifierSessionProvider'
import { useAccessibilitySettings } from '../a11y/useAccessibilitySettings'
import { SettingsProvider } from '../a11y/SettingsContext'
import { ReducedMotionOverrideProvider } from '../a11y/ReducedMotionOverrideProvider'
import { ToastProvider } from './Toast'
import { AriaLockAnnouncer } from '../a11y/AriaLockAnnouncer'
import { useAriaLabelMap } from '../a11y/useAriaLabelMap'
import { DebugPanel } from './DebugPanel'
import { MeasurementPanel } from './MeasurementPanel'
import { FirstRunCoach } from './FirstRunCoach'
import { DrivingProvider } from './phone/DrivingContext'
import { PhoneApp } from './phone/PhoneApp'
import { MapsSketch } from './surfaces/MapsSketch'
import { MusicSketch } from './surfaces/MusicSketch'

export interface PrototypeStageProps {
  /** When true, renders the floating debug panel for parked/driving + a11y overrides. */
  showDebugPanel?: boolean
  /** When true, shows the one-time attention ring on the orb (standalone demo). */
  showCoach?: boolean
}

/**
 * Reusable composition of the CarPlay prototype. Renders the 720x400 screen
 * with the rainbow edge bloom, the chrome (orb + dock), and the current
 * surface (phone, maps, music). Used both standalone at /prototype and
 * embedded inside the case study page.
 */
export function PrototypeStage({ showDebugPanel = false, showCoach = false }: PrototypeStageProps) {
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
              <MagnifierSessionProvider>
              <AnnouncerShell />
              <ShellWiring screenRef={screenRef} />
              {/* The live measurement instrument. Inside MagnifierProvider so
                  it sees the telemetry recorder; gated to the standalone route
                  so it never appears on the embedded case-study stage. */}
              {showDebugPanel && <MeasurementPanel />}
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
                {/* The single liquid-glass lens flows over the locked target in
                    an unclipped overlay layer above the chrome. */}
                <LiquidLens screenRef={screenRef} />
                {showCoach && <FirstRunCoach screenRef={screenRef} />}
              </div>
              </MagnifierSessionProvider>
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
 * screen bounds.
 *
 * The rotary drag itself is driven by the orb's own window listeners (see
 * MasterOrb), which keep tracking after the pointer-capture loss a list reflow
 * causes. There is no global "long-press anywhere" listener: each cell that
 * opts in (via ExpandableCell) owns its own hold recognition. The only entry
 * into the rotary magnifier is the orb's drag gesture.
 */
function ShellWiring({ screenRef }: { screenRef: React.RefObject<HTMLDivElement | null> }) {
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
