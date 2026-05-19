/* TS mirror of spatial.css for JS-driven calculations (hit-testing, distances). */

export const space = {
  orb: 34,
  glass: 46,
  glassRadius: 14,
  glassFlexScale: 1.08,

  magnifyScale: 1.25,
  lockRadius: 40,
  lockRadiusResistive: 50,

  membraneHysteresisFraction: 0.60,

  thresholdTapTimeMs: 250,
  thresholdDragDistPx: 8,
  thresholdSwipeCancelPx: 60,
  thresholdSwipeRowPx: 40,
  thresholdSwipeTabPx: 60,

  auraBlur: 22,

  dockWidth: 56,
  dockGap: 6,
  dockIcon: 36,

  tabPillHeight: 36,
  tabSegmentPad: 12,
  rowHeight: 44,
  rowHeightDriving: 56,
} as const
