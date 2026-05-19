import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import type { MagnifiableTarget, MagnifierContextValue } from './types'
import {
  MagnifierContext,
  InternalContext,
  type MagnifierInternalAPI,
} from './MagnifierContext'

export interface MagnifierProviderProps {
  children: ReactNode
}

export function MagnifierProvider({ children }: MagnifierProviderProps) {
  const targetsRef = useRef<Map<string, MagnifiableTarget>>(new Map())
  const [lockedId, setLockedId] = useState<string | null>(null)
  const [rotaryActive, setRotaryActive] = useState(false)

  const register = useCallback((t: MagnifiableTarget) => {
    targetsRef.current.set(t.id, t)
    return () => {
      targetsRef.current.delete(t.id)
    }
  }, [])

  const publicValue = useMemo<MagnifierContextValue>(
    () => ({ register, lockedId, rotaryActive }),
    [register, lockedId, rotaryActive],
  )

  const internalValue = useMemo<MagnifierInternalAPI>(
    () => ({
      getTargets: () => targetsRef.current,
      setLockedId,
      setRotaryActive,
    }),
    [],
  )

  return (
    <MagnifierContext.Provider value={publicValue}>
      <InternalContext.Provider value={internalValue}>
        {children}
      </InternalContext.Provider>
    </MagnifierContext.Provider>
  )
}
