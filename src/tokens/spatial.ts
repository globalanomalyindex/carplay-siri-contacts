/* TS mirror of spatial.css for JS-driven calculations (hit-testing, distances). */

export const space = {
  orb: 34,
  glass: 46,
  glassRadius: 14,
  glassFlexScale: 1.08,

  /** Scale a locked rotary target swells to: the loupe / Fitts magnification. */
  magnifyScale: 1.12,

  membraneHysteresisFraction: 0.60,

  thresholdTapTimeMs: 250,
  thresholdDragDistPx: 8,
  thresholdSwipeCancelPx: 60,
  thresholdSwipeRowPx: 40,
  thresholdSwipeTabPx: 60,

  /* Unified hold gesture (ExpandableCell). The three feel knobs. */
  holdArmMs: 180, //  hold this long, then a slide hands off to the magnifier
  holdMenuMs: 480, // keep holding in place this long, the contextual menu opens
  slideThresholdPx: 24, // post-arm move this far -> a decisive slide
  // Rest the magnifier lens on one target this long during a slide and its
  // contextual menu opens, so a single uninterrupted hold can hover a contact
  // and reach its actions. Keyed on lock stability, not stillness, so a tremor
  // that keeps the same target locked still counts as holding.
  dwellMenuMs: 1000,

  /* Liquid lens halo around the locked target. */
  lensPadX: 6,
  lensPadY: 5,

  auraBlur: 22,

  dockWidth: 56,
  dockGap: 6,
  dockIcon: 36,

  tabPillHeight: 36,
  tabSegmentPad: 12,
  rowHeight: 44,
  rowHeightDriving: 56,
} as const
