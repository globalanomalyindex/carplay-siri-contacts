import { useEffect } from 'react'
import { useMagnifierContext } from './MagnifierContext'
import type { MagnifiableTarget } from './types'

export function useMagnifiable(target: MagnifiableTarget): void {
  const { register } = useMagnifierContext()
  useEffect(() => {
    const unregister = register(target)
    return unregister
  }, [register, target])
}
