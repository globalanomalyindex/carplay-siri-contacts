import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import type { GestureDirection, MagnifiableTarget, MagnifierContextValue, MenuRequest } from './types'
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
  const [gestureDirection, setGestureDirection] = useState<GestureDirection>('idle')
  const [lastCommit, setLastCommit] = useState<{ id: string | null; at: number }>(
    { id: null, at: 0 },
  )
  const [menuRequest, setMenuRequest] = useState<MenuRequest | null>(null)

  const register = useCallback((t: MagnifiableTarget) => {
    targetsRef.current.set(t.id, t)
    return () => {
      targetsRef.current.delete(t.id)
    }
  }, [])

  const recordCommit = useCallback((id: string) => {
    setLastCommit({ id, at: Date.now() })
  }, [])

  const requestMenu = useCallback((id: string, point: { x: number; y: number }) => {
    setMenuRequest({ id, at: Date.now(), x: point.x, y: point.y })
  }, [])

  const clearMenuRequest = useCallback(() => {
    setMenuRequest(null)
  }, [])

  const publicValue = useMemo<MagnifierContextValue>(
    () => ({
      register,
      lockedId,
      rotaryActive,
      gestureDirection,
      menuRequest,
      clearMenuRequest,
      lastCommittedId: lastCommit.id,
      lastCommittedAt: lastCommit.at,
    }),
    [register, lockedId, rotaryActive, gestureDirection, menuRequest, clearMenuRequest, lastCommit],
  )

  const internalValue = useMemo<MagnifierInternalAPI>(
    () => ({
      getTargets: () => targetsRef.current,
      setLockedId,
      setRotaryActive,
      setGestureDirection,
      recordCommit,
      requestMenu,
    }),
    [recordCommit, requestMenu],
  )

  return (
    <MagnifierContext.Provider value={publicValue}>
      <InternalContext.Provider value={internalValue}>
        {children}
      </InternalContext.Provider>
    </MagnifierContext.Provider>
  )
}
