import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { OrbControlContext, type OrbControlValue } from './OrbControlContext'

export interface OrbControlProviderProps {
  children: ReactNode
}

/**
 * Shell-level orb control provider. Owns the externally-visible orb state
 * (siriActive, rotaryActive) and the imperative dismiss/abort handles. The
 * MasterOrb subscribes via _register; the rest of the app reads via the
 * stable public API.
 */
export function OrbControlProvider({ children }: OrbControlProviderProps) {
  const [pub, setPub] = useState<{ siriActive: boolean; rotaryActive: boolean }>({
    siriActive: false,
    rotaryActive: false,
  })

  const apiRef = useRef<{
    isSiriActive: () => boolean
    isRotaryActive: () => boolean
    dismissSiri: () => void
    abortRotary: () => void
  } | null>(null)

  const _register = useCallback<OrbControlValue['_register']>((api) => {
    apiRef.current = api
  }, [])

  const _publish = useCallback<OrbControlValue['_publish']>((next) => {
    setPub((prev) =>
      prev.siriActive === next.siriActive && prev.rotaryActive === next.rotaryActive
        ? prev
        : next,
    )
  }, [])

  const dismissSiri = useCallback(() => {
    apiRef.current?.dismissSiri()
  }, [])

  const abortRotary = useCallback(() => {
    apiRef.current?.abortRotary()
  }, [])

  const value = useMemo<OrbControlValue>(
    () => ({
      siriActive: pub.siriActive,
      rotaryActive: pub.rotaryActive,
      dismissSiri,
      abortRotary,
      _register,
      _publish,
    }),
    [pub.siriActive, pub.rotaryActive, dismissSiri, abortRotary, _register, _publish],
  )

  return (
    <OrbControlContext.Provider value={value}>
      {children}
    </OrbControlContext.Provider>
  )
}
