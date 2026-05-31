/* TS mirror of motion.css for Motion (Framer) configs that need numeric values. */

export const easing = {
  liquidOut:      [0.08, 0.82, 0.17, 1.00] as [number, number, number, number],
  liquidIn:       [0.83, 0.00, 0.92, 0.18] as [number, number, number, number],
  magnifyLock:    [0.20, 0.90, 0.30, 1.00] as [number, number, number, number],
  ambientBreathe: [0.45, 0.05, 0.55, 0.95] as [number, number, number, number],
  snapFire:       [0.30, 0.00, 0.20, 1.00] as [number, number, number, number],
  frameEmerge:    [0.20, 0.80, 0.30, 1.00] as [number, number, number, number],
  auraTravel:     [0.40, 0.00, 0.20, 1.00] as [number, number, number, number],
  cellMembrane:   [0.60, 0.00, 0.80, 0.30] as [number, number, number, number],
} as const

export const springs = {
  glassFlex: { damping: 0.62, stiffness: 240 },
  /** The single liquid lens flowing between locked targets. */
  lensFlow: { stiffness: 480, damping: 34, mass: 0.7 },
  /** A small control snapping to its magnified lock. */
  lockSnap: { stiffness: 340, damping: 26, mass: 0.45 },
  /** An ExpandableCell reflowing as its menu opens. */
  cellExpand: { stiffness: 280, damping: 28, mass: 0.5 },
  /** Action chips fanning into a menu. */
  chipFan: { stiffness: 320, damping: 28, mass: 0.5 },
} as const

/* Durations in seconds (Motion uses seconds, CSS uses ms). */
export const dur = {
  dissipate:           0.18,
  reform:              0.22,
  magnify:             0.24,
  flash:               0.32,
  frameEmerge:         0.18,
  frameEmergeStagger:  0.02,
  frameEmergeCap:      0.10,
  auraTravel:          0.14,
  longPressThreshold:  0.25,
  auraCycle:           3.0,
  ambientBreathe:      6.0,
} as const
