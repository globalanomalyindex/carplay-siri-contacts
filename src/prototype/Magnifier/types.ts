export type MagnifierBehavior = 'snapToCenter' | 'freeDrift'

export interface MagnifiableTarget {
  id: string
  ref: React.RefObject<HTMLElement | null>
  behavior: MagnifierBehavior
  onCommit: (point?: { x: number; y: number }) => void
  label?: string
}

export interface MagnifierContextValue {
  register: (target: MagnifiableTarget) => () => void
  lockedId: string | null
  rotaryActive: boolean
}
