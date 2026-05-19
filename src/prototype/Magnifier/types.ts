export type MagnifierBehavior = 'snapToCenter' | 'freeDrift'

/** Cardinal direction of a quick action chip around its center anchor. */
export type QuickActionPosition = 'up' | 'right' | 'down' | 'left'

export interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  position: QuickActionPosition
  onAction: () => void
}

export interface MagnifiableTarget {
  id: string
  ref: React.RefObject<HTMLElement | null>
  behavior: MagnifierBehavior
  onCommit: (point?: { x: number; y: number }) => void
  label?: string
  /**
   * Optional cardinal-quadrant menu shown when the user long-presses on
   * this target instead of the default rotary lock. Up to four actions,
   * one per cardinal direction. When absent, long-press starts rotary
   * mode as usual.
   */
  quickActions?: QuickAction[]
}

/**
 * Classification of the recent pointer trail during a magnifier session.
 * Consumers (e.g. PhoneApp tab preview) use this to disambiguate when the
 * same lockedId reads differently depending on gesture direction: a tab
 * lock during a vertical drag is a fly-through, not an intent to preview.
 */
export type GestureDirection = 'horizontal' | 'vertical' | 'idle'

export interface MagnifierContextValue {
  register: (target: MagnifiableTarget) => () => void
  lockedId: string | null
  rotaryActive: boolean
  /** Classification of the recent pointer trail; 'idle' while idle. */
  gestureDirection: GestureDirection
  /**
   * Id of the most recently committed target, or null if none yet. Paired
   * with `lastCommittedAt` so consumers can drive a one-shot success flash
   * keyed on the timestamp (re-committing the same id retriggers the flash).
   */
  lastCommittedId: string | null
  /** Monotonic timestamp (Date.now()) when the last commit fired. */
  lastCommittedAt: number
}
