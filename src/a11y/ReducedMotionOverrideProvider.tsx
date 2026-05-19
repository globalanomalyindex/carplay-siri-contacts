import type { ReactNode } from 'react'
import { ReducedMotionOverrideContext } from './useReducedMotion'

/**
 * Wraps children so any `useReducedMotion()` call beneath reports `true` when
 * `value` is true, regardless of the OS media query. Used to plumb the manual
 * "Force Reduced Motion" accessibility setting.
 */
export function ReducedMotionOverrideProvider({
  value,
  children,
}: {
  value: boolean
  children: ReactNode
}) {
  return (
    <ReducedMotionOverrideContext.Provider value={value}>
      {children}
    </ReducedMotionOverrideContext.Provider>
  )
}
