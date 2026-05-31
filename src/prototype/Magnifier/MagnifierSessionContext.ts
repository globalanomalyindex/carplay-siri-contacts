import { createContext, useContext } from 'react'
import type { Point } from './geometry'

export interface MagnifierSessionApi {
  /**
   * Hand off from a held cell into a magnifier slide. The controller (a stable
   * owner that does not unmount when the list reflows under the origin cell)
   * drives the lens from here to the lift and commits whatever it lands on.
   */
  beginSlide: (point: Point) => void
  /** Whether a controller-driven slide is currently in progress. */
  isSliding: () => boolean
}

const NOOP: MagnifierSessionApi = { beginSlide: () => {}, isSliding: () => false }

export const MagnifierSessionContext = createContext<MagnifierSessionApi | null>(null)

/** Optional: returns a no-op session when no provider is present (e.g. tests). */
export function useMagnifierSession(): MagnifierSessionApi {
  return useContext(MagnifierSessionContext) ?? NOOP
}
