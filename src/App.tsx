import { useCallback, useRef, useState } from 'react'
import { CarPlayChrome } from './prototype/chrome/CarPlayChrome'
import { DockSwitcher, type DockSurface } from './prototype/chrome/DockSwitcher'
import { ScreenEdgeAura } from './prototype/chrome/ScreenEdgeAura'
import { ScreenEdgeAuraRim } from './prototype/chrome/ScreenEdgeAuraRim'
import { MasterOrb } from './prototype/MasterOrb/MasterOrb'
import { OrbControlProvider } from './prototype/MasterOrb/OrbControlProvider'
import { useOrbControl } from './prototype/MasterOrb/OrbControlContext'
import { useGlobalSiriDismiss } from './prototype/MasterOrb/useGlobalSiriDismiss'
import { useSwipeOffScreenAbort } from './prototype/MasterOrb/useSwipeOffScreenAbort'
import {
  MagnifierProvider,
  QuickActions,
  findQuickActionsTargetAtPoint,
  useMagnifierDriver,
  useMagnifierInternal,
  type MagnifiableTarget,
} from './prototype/Magnifier'
import { useLongPressAnywhere } from './prototype/Magnifier/useLongPressAnywhere'
import { useLongPressRotarySession } from './prototype/Magnifier/useLongPressRotarySession'
import { useAccessibilitySettings } from './a11y/useAccessibilitySettings'
import { SettingsProvider } from './a11y/SettingsContext'
import { ReducedMotionOverrideProvider } from './a11y/ReducedMotionOverrideProvider'
import { ToastProvider } from './prototype/Toast'
import { AriaLockAnnouncer } from './a11y/AriaLockAnnouncer'
import { useAriaLabelMap } from './a11y/useAriaLabelMap'
import { DebugPanel } from './prototype/DebugPanel'
import { DrivingProvider } from './prototype/phone/DrivingContext'
import { PhoneApp } from './prototype/phone/PhoneApp'
import { MapsSketch } from './prototype/surfaces/MapsSketch'
import { MusicSketch } from './prototype/surfaces/MusicSketch'

function App() {
  const { settings, update } = useAccessibilitySettings()
  const [driving, setDriving] = useState(false)
  const [surface, setSurface] = useState<DockSurface>('phone')
  const screenRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
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
      </ReducedMotionOverrideProvider>
      <DebugPanel
        settings={settings}
        update={update}
        driving={driving}
        setDriving={setDriving}
      />
    </div>
  )
}

/**
 * Co-locates the window-level hooks that need MagnifierProvider + OrbControl
 * context. Long-press-anywhere is always on (default tap-rescue). Global Siri
 * dismiss listens for taps outside the orb when Siri is active. Swipe-off-
 * screen aborts rotary if the pointer leaves the CarPlay screen bounds.
 *
 * Long-press triage: when the touch point sits over a magnifiable target
 * that carries `quickActions`, the contextual menu opens instead of rotary.
 * Otherwise the rotary path runs as before.
 */
function ShellWiring({ screenRef }: { screenRef: React.RefObject<HTMLDivElement | null> }) {
  const driver = useMagnifierDriver()
  const { getTargets } = useMagnifierInternal()
  const [quickActions, setQuickActions] = useState<{
    target: MagnifiableTarget
    anchor: { x: number; y: number }
  } | null>(null)

  const onLongPress = useCallback(
    (p: { x: number; y: number }) => {
      const target = findQuickActionsTargetAtPoint(getTargets(), p)
      if (target) {
        setQuickActions({ target, anchor: p })
      } else {
        driver.start()
      }
    },
    [driver, getTargets],
  )

  useLongPressAnywhere({ enabled: !quickActions, onLongPress })
  useLongPressRotarySession()
  useGlobalSiriDismiss()
  useSwipeOffScreenAbort({ screenRef })

  return quickActions ? (
    <QuickActions
      anchor={quickActions.anchor}
      actions={quickActions.target.quickActions!}
      onClose={() => setQuickActions(null)}
    />
  ) : null
}

/**
 * Pulls Siri-active state from OrbControl and decides whether to paint the
 * screen-edge rainbow bloom. Sits behind the chrome.
 */
function ScreenEdgeAuraGate() {
  const { siriActive } = useOrbControl()
  return <ScreenEdgeAura active={siriActive} />
}

/**
 * The crisp inset rim paired with the bloom. Sits on top of the chrome so
 * its white-edge highlight and inner glow trace the screen's actual rounded
 * corner.
 */
function ScreenEdgeAuraRimGate() {
  const { siriActive } = useOrbControl()
  return <ScreenEdgeAuraRim active={siriActive} />
}

function AnnouncerShell() {
  const labels = useAriaLabelMap()
  return <AriaLockAnnouncer labels={labels} />
}

export default App
