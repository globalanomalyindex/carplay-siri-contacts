export type MagnifierBehavior = 'snapToCenter' | 'freeDrift'

/**
 * Spatial region a target belongs to. The driver only considers targets in the
 * pointer's current region, so a wide content row can never be out-competed by
 * a dock icon or a tab whose centre happens to sit nearer. The regions map to
 * the CarPlay layout: the left rail, the top tab band, and everything else.
 */
export type MagnifierRegion = 'dock' | 'tabs' | 'content'

export interface MagnifiableTarget {
  id: string
  ref: React.RefObject<HTMLElement | null>
  behavior: MagnifierBehavior
  onCommit: (point?: { x: number; y: number }) => void
  label?: string
  /** Spatial region for hit-test gating. Defaults to 'content'. */
  region?: MagnifierRegion
  /**
   * Quickdraw: fire onCommit the instant the lens locks onto this target,
   * not on lift. The dock uses this so dragging across it switches apps live,
   * the way a physical quick-draw works. Reserve it for non-destructive
   * navigation (switching a surface) and never for one-shot actions like
   * placing a call, which must wait for a deliberate lift.
   */
  quickdraw?: boolean
}

/**
 * Classification of the recent pointer trail during a magnifier session.
 * Consumers (e.g. PhoneApp tab preview) use this to disambiguate when the
 * same lockedId reads differently depending on gesture direction: a tab
 * lock during a vertical drag is a fly-through, not an intent to preview.
 */
export type GestureDirection = 'horizontal' | 'vertical' | 'idle'

/**
 * A request, raised by the driver when the lens dwells on a target, for that
 * target's cell to open its contextual menu and adopt the still-held gesture.
 * The point is where the finger was resting so the cell can seed chip
 * selection; `at` is a monotonic timestamp so a cell handles each one once.
 */
export interface MenuRequest {
  id: string
  at: number
  x: number
  y: number
}

export interface MagnifierContextValue {
  register: (target: MagnifiableTarget) => () => void
  lockedId: string | null
  rotaryActive: boolean
  /** Classification of the recent pointer trail; 'idle' while idle. */
  gestureDirection: GestureDirection
  /**
   * Set when a dwell asks a target's cell to open its menu, else null. The
   * matching ExpandableCell consumes it and calls `clearMenuRequest`.
   */
  menuRequest: MenuRequest | null
  /** Acknowledge a consumed menu request so it cannot re-fire on remount. */
  clearMenuRequest: () => void
  /**
   * Id of the most recently committed target, or null if none yet. Paired
   * with `lastCommittedAt` so consumers can drive a one-shot success flash
   * keyed on the timestamp (re-committing the same id retriggers the flash).
   */
  lastCommittedId: string | null
  /** Monotonic timestamp (Date.now()) when the last commit fired. */
  lastCommittedAt: number
}
