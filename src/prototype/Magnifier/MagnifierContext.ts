import { createContext, useContext } from 'react'
import type { GestureDirection, MagnifiableTarget, MagnifierContextValue } from './types'

export const MagnifierContext = createContext<MagnifierContextValue | null>(null)

export function useMagnifierContext(): MagnifierContextValue {
  const ctx = useContext(MagnifierContext)
  if (!ctx) {
    throw new Error('useMagnifierContext must be used inside a <MagnifierProvider>')
  }
  return ctx
}

export interface MagnifierInternalAPI {
  getTargets: () => Map<string, MagnifiableTarget>
  setLockedId: (id: string | null) => void
  setRotaryActive: (active: boolean) => void
  setGestureDirection: (direction: GestureDirection) => void
  /**
   * Record a commit. Driver calls this once when end() fires onCommit so
   * MagnifiableFrame can play the success flash. The timestamp is the
   * key: re-committing the same id still bumps it so the flash retriggers.
   */
  recordCommit: (id: string) => void
  /**
   * Raise a menu request for `id` at the resting point. Driver calls this when
   * the lens has dwelled on a target long enough to open its contextual menu.
   */
  requestMenu: (id: string, point: { x: number; y: number }) => void
}

export const InternalContext = createContext<MagnifierInternalAPI | null>(null)

export function useMagnifierInternal(): MagnifierInternalAPI {
  const ctx = useContext(InternalContext)
  if (!ctx) {
    throw new Error('useMagnifierInternal must be used inside a <MagnifierProvider>')
  }
  return ctx
}
