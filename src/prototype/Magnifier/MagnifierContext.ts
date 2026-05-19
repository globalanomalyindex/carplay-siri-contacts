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
}

/**
 * Find the smallest registered target whose bounding rect contains the
 * point AND which carries a quickActions list. Returns null when no such
 * target sits under the point. Used by the long-press path to decide
 * whether to open the contextual menu vs. start rotary mode.
 */
export function findQuickActionsTargetAtPoint(
  targets: Map<string, MagnifiableTarget>,
  point: { x: number; y: number },
): MagnifiableTarget | null {
  let best: { target: MagnifiableTarget; area: number } | null = null
  for (const [, t] of targets) {
    if (!t.quickActions || t.quickActions.length === 0) continue
    const el = t.ref.current
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (
      point.x >= r.left &&
      point.x <= r.right &&
      point.y >= r.top &&
      point.y <= r.bottom
    ) {
      const area = r.width * r.height
      if (!best || area < best.area) best = { target: t, area }
    }
  }
  return best ? best.target : null
}

export const InternalContext = createContext<MagnifierInternalAPI | null>(null)

export function useMagnifierInternal(): MagnifierInternalAPI {
  const ctx = useContext(InternalContext)
  if (!ctx) {
    throw new Error('useMagnifierInternal must be used inside a <MagnifierProvider>')
  }
  return ctx
}
