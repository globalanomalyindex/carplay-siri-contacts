export type MagnifierBehavior = 'snapToCenter' | 'freeDrift'

export interface MagnifiableTarget {
  id: string
  ref: React.RefObject<HTMLElement | null>
  behavior: MagnifierBehavior
  onCommit: (point?: { x: number; y: number }) => void
  label?: string
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
}
