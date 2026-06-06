import { useEffect, useMemo, useRef } from 'react'
import { useMagnifierContext } from './MagnifierContext'
import type { MagnifiableTarget } from './types'

/**
 * Register a magnifiable target with the provider for its lifetime.
 *
 * Callers build the descriptor inline, so a naive effect keyed on the whole
 * object would unregister and re-register on every render. Instead we register
 * once per stable identity (id, ref, behavior, label, region, quickdraw) and
 * route onCommit through a ref, so a fresh closure each render never churns the
 * registry. The registry holds at most one entry per target across the gesture.
 */
export function useMagnifiable(target: MagnifiableTarget): void {
  const { register } = useMagnifierContext()
  const { id, ref, behavior, label, region, quickdraw } = target

  // Keep the latest onCommit reachable without re-registering.
  const onCommitRef = useRef(target.onCommit)
  useEffect(() => {
    onCommitRef.current = target.onCommit
  }, [target.onCommit])

  const entry = useMemo<MagnifiableTarget>(
    () => ({
      id,
      ref,
      behavior,
      label,
      region,
      quickdraw,
      onCommit: (point) => onCommitRef.current(point),
    }),
    [id, ref, behavior, label, region, quickdraw],
  )

  useEffect(() => {
    const unregister = register(entry)
    return unregister
  }, [register, entry])
}
