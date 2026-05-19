import { useCallback, useRef, useState } from 'react'
import { CarPlayChrome } from './chrome/CarPlayChrome'
import { DockSwitcher, type DockSurface } from './chrome/DockSwitcher'
import { ScreenEdgeAura } from './chrome/ScreenEdgeAura'
import { ScreenEdgeAuraRim } from './chrome/ScreenEdgeAuraRim'
import { MasterOrb } from './MasterOrb/MasterOrb'
import { OrbControlProvider } from './MasterOrb/OrbControlProvider'
import { useOrbControl } from './MasterOrb/OrbControlContext'
import { useGlobalSiriDismiss } from './MasterOrb/useGlobalSiriDismiss'
import { useSwipeOffScreenAbort } from './MasterOrb/useSwipeOffScreenAbort'
import {
  MagnifierProvider,
  QuickActions,
  findQuickActionsTargetAtPoint,
  useMagnifierDriver,
  useMagnifierInternal,
  type MagnifiableTarget,
} from './Magnifier'
import { useLongPressAnywhere } from './Magnifier/useLongPressAnywhere'
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
 * context. Long-press-anywhere is always on (default tap-rescue). Global Siri
 * dismiss listens for taps outside the orb when Siri is active. Swipe-off-
 * screen aborts rotary if the pointer leaves the CarPlay screen bounds.
 *
 * Long-press triage: when the touch point sits over a magnifiable target
 * that carries `quickActions`, the contextual menu opens instead of rotary.
 * Otherwise the rotary path runs as before.
 *
 * Scope guard: the long-press listener is window-level, but we only honor it
 * when the press origin sits inside the CarPlay screen rect. This matters
 * when the prototype is embedded in the case study; a long-press on body
 * text should not trigger the magnifier inside the screen.
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
      // Gate: the press must originate inside the CarPlay screen rect.
      // Outside (e.g., the user holding on case study body text) is a no-op.
      const el = screenRef.current
      if (el) {
        const r = el.getBoundingClientRect()
        if (p.x < r.left || p.x > r.right || p.y < r.top || p.y > r.bottom) {
          return
        }
      }
      const target = findQuickActionsTargetAtPoint(getTargets(), p)
      if (target) {
        setQuickActions({ target, anchor: p })
      } else {
        driver.start()
      }
    },
    [driver, getTargets, screenRef],
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
