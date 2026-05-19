import { createContext, useContext } from 'react'
import type { MagnifiableTarget, MagnifierContextValue } from './types'

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
}

export const InternalContext = createContext<MagnifierInternalAPI | null>(null)

export function useMagnifierInternal(): MagnifierInternalAPI {
  const ctx = useContext(InternalContext)
  if (!ctx) {
    throw new Error('useMagnifierInternal must be used inside a <MagnifierProvider>')
  }
  return ctx
}
