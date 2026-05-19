import { createContext, useContext, useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Optional manual override of the OS reduce-motion setting. The default value
 * is false (no override), so callers outside the provider keep their existing
 * behavior and read the OS media query directly.
 */
export const ReducedMotionOverrideContext = createContext<boolean>(false)

/**
 * Returns true when the OS or browser is set to reduce motion, OR when the
 * surrounding `<ReducedMotionOverrideProvider>` forces it on.
 * Used throughout the prototype to pick a motion-light alternative path.
 */
export function useReducedMotion(): boolean {
  const override = useContext(ReducedMotionOverrideContext)
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return override || reduced
}
