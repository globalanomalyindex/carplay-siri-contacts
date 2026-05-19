import { createContext, useContext } from 'react'

/**
 * App-wide channel so the orchestrating shell can read orb state (e.g. whether
 * Siri is currently active) and dismiss Siri without having to own the orb
 * state machine. The MasterOrb writes here; rescue/dismiss hooks subscribe.
 *
 * Defaults are inert no-ops so consumers can call dismissSiri/abortRotary
 * before the orb has registered without crashing.
 */
export interface OrbControlValue {
  siriActive: boolean
  rotaryActive: boolean
  /** Send a window-level dismiss to drop Siri (no-op if not active). */
  dismissSiri: () => void
  /** Send a window-level abort to drop rotary (no-op if not active). */
  abortRotary: () => void
  /** Internal: MasterOrb calls this to register itself with the shell. */
  _register: (api: {
    isSiriActive: () => boolean
    isRotaryActive: () => boolean
    dismissSiri: () => void
    abortRotary: () => void
  }) => void
  /** Internal: MasterOrb publishes state changes here. */
  _publish: (state: { siriActive: boolean; rotaryActive: boolean }) => void
}

export const OrbControlContext = createContext<OrbControlValue | null>(null)

export function useOrbControl(): OrbControlValue {
  const ctx = useContext(OrbControlContext)
  if (!ctx) {
    throw new Error('useOrbControl must be used inside <OrbControlProvider>')
  }
  return ctx
}
