import { describe, it, expect } from 'vitest'
import {
  distance,
  pickLockedTarget,
  isPastHysteresis,
  computeGestureDirection,
  pointInRect,
  regionOfPoint,
  pickMagnifierTarget,
  type TargetGeometry,
} from './geometry'
import type { MagnifierRegion } from './types'

const rectFor = (x: number, y: number, w = 60, h = 30): DOMRect =>
  ({
    x, y, width: w, height: h,
    top: y, left: x, bottom: y + h, right: x + w,
    toJSON: () => ({}),
  }) as DOMRect

describe('distance', () => {
  it('measures point-to-rect-center distance', () => {
    const r = rectFor(0, 0)
    expect(distance({ x: 30, y: 15 }, r)).toBe(0)
    expect(Math.round(distance({ x: 0, y: 0 }, r))).toBe(34)
  })
})

describe('pickLockedTarget', () => {
  it('returns the target whose center is closest to the point', () => {
    const targets = new Map([
      ['a', { rect: rectFor(0, 0) }],
      ['b', { rect: rectFor(100, 0) }],
      ['c', { rect: rectFor(200, 0) }],
    ])
    expect(pickLockedTarget({ x: 110, y: 15 }, targets, null, 0.6)).toBe('b')
  })

  it('honors hysteresis: keeps current lock until 60% past next center', () => {
    const targets = new Map([
      ['a', { rect: rectFor(0, 0) }],
      ['b', { rect: rectFor(100, 0) }],
    ])
    expect(pickLockedTarget({ x: 85, y: 15 }, targets, 'a', 0.6)).toBe('a')
    expect(pickLockedTarget({ x: 92, y: 15 }, targets, 'a', 0.6)).toBe('b')
  })

  it('uses nearest-center when no current lock exists', () => {
    const targets = new Map([
      ['a', { rect: rectFor(0, 0) }],
      ['b', { rect: rectFor(100, 0) }],
    ])
    expect(pickLockedTarget({ x: 55, y: 15 }, targets, null, 0.6)).toBe('a')
    expect(pickLockedTarget({ x: 95, y: 15 }, targets, null, 0.6)).toBe('b')
  })
})

describe('isPastHysteresis', () => {
  it('is true when point is past hysteresis fraction toward other center', () => {
    const from = rectFor(0, 0)
    const to   = rectFor(100, 0)
    expect(isPastHysteresis({ x: 89, y: 15 }, from, to, 0.6)).toBe(false)
    expect(isPastHysteresis({ x: 91, y: 15 }, from, to, 0.6)).toBe(true)
  })
})

describe('computeGestureDirection', () => {
  it('returns idle for empty or single-sample input', () => {
    expect(computeGestureDirection([])).toBe('idle')
    expect(computeGestureDirection([{ x: 10, y: 10 }])).toBe('idle')
  })

  it('returns idle when total motion is below threshold', () => {
    const trail = [
      { x: 100, y: 100 },
      { x: 102, y: 101 },
      { x: 101, y: 102 },
    ]
    expect(computeGestureDirection(trail)).toBe('idle')
  })

  it('classifies a clean horizontal sweep as horizontal', () => {
    const trail = [
      { x: 100, y: 100 },
      { x: 120, y: 101 },
      { x: 140, y: 100 },
      { x: 160, y: 101 },
      { x: 180, y: 100 },
    ]
    expect(computeGestureDirection(trail)).toBe('horizontal')
  })

  it('classifies a clean vertical drag as vertical', () => {
    const trail = [
      { x: 100, y: 100 },
      { x: 101, y: 120 },
      { x: 100, y: 140 },
      { x: 101, y: 160 },
      { x: 100, y: 180 },
    ]
    expect(computeGestureDirection(trail)).toBe('vertical')
  })

  it('returns idle for diagonal motion below dominance threshold', () => {
    const trail = [
      { x: 100, y: 100 },
      { x: 115, y: 115 },
      { x: 130, y: 130 },
      { x: 145, y: 145 },
    ]
    expect(computeGestureDirection(trail)).toBe('idle')
  })

  it('respects custom dominantFraction', () => {
    const trail = [
      { x: 100, y: 100 },
      { x: 120, y: 105 },
      { x: 140, y: 110 },
    ]
    // Default 0.6: horizontal share is 40/(40+10)=0.8, qualifies as horizontal.
    expect(computeGestureDirection(trail)).toBe('horizontal')
    // Stricter 0.9 threshold: same trail no longer qualifies.
    expect(computeGestureDirection(trail, { dominantFraction: 0.9 })).toBe('idle')
  })
})

// Mirrors the real CarPlay layout: a dock icon on the left rail, a tab in the
// top band, and a wide content row whose centre sits far to the right.
const geo = (
  x: number,
  y: number,
  w: number,
  h: number,
  region: MagnifierRegion,
): TargetGeometry => ({ rect: rectFor(x, y, w, h), region })

describe('pointInRect', () => {
  it('is inclusive of the rect edges', () => {
    const r = rectFor(10, 10, 40, 40)
    expect(pointInRect({ x: 30, y: 30 }, r)).toBe(true)
    expect(pointInRect({ x: 10, y: 10 }, r)).toBe(true)
    expect(pointInRect({ x: 51, y: 30 }, r)).toBe(false)
  })
})

describe('regionOfPoint', () => {
  const targets = new Map<string, TargetGeometry>([
    ['dock-phone', geo(10, 100, 40, 40, 'dock')], // right edge 50
    ['tab-a', geo(200, 10, 80, 30, 'tabs')], // bottom edge 40
    ['row-a', geo(120, 100, 300, 40, 'content')],
  ])

  it('classifies the left rail as dock', () => {
    expect(regionOfPoint({ x: 30, y: 120 }, targets)).toBe('dock')
  })
  it('classifies the top band (right of the dock) as tabs', () => {
    expect(regionOfPoint({ x: 240, y: 25 }, targets)).toBe('tabs')
  })
  it('classifies the rest as content', () => {
    expect(regionOfPoint({ x: 300, y: 120 }, targets)).toBe('content')
  })
})

describe('pickMagnifierTarget', () => {
  // dock centre (30,120); row spans x[120..420] y[100..140], centre (270,120).
  const targets = new Map<string, TargetGeometry>([
    ['dock-phone', geo(10, 100, 40, 40, 'dock')],
    ['tab-a', geo(200, 10, 80, 30, 'tabs')],
    ['row-a', geo(120, 100, 300, 40, 'content')],
  ])

  it('locks the row under the finger even when a dock centre is nearer', () => {
    // (140,120) is inside the row but its centre (270,120) is 130px away,
    // while the dock centre (30,120) is only 110px away. Nearest-centre would
    // wrongly pick the dock; containment + region gating pick the row.
    expect(pickMagnifierTarget({ x: 140, y: 120 }, targets, null, 0.6)).toBe('row-a')
  })

  it('never returns a dock target while the pointer is in the content region', () => {
    // A gap below the row, far from any content centre, must still not fall
    // back to the dock (different region).
    expect(pickMagnifierTarget({ x: 300, y: 200 }, targets, null, 0.6)).toBe('row-a')
  })

  it('selects the dock only when the pointer is over the left rail', () => {
    expect(pickMagnifierTarget({ x: 30, y: 120 }, targets, null, 0.6)).toBe('dock-phone')
  })

  it('holds the current lock while the pointer stays inside its bounds', () => {
    const nested = new Map<string, TargetGeometry>([
      ['row-wide', geo(120, 100, 300, 40, 'content')],
      ['row-tiny', geo(130, 110, 20, 20, 'content')], // smaller, centre (140,120)
    ])
    // With no lock, the smaller contained target wins.
    expect(pickMagnifierTarget({ x: 140, y: 120 }, nested, null, 0.6)).toBe('row-tiny')
    // With the wide row already locked and the pointer still inside it, the
    // membrane holds: it does not jump to the smaller target.
    expect(pickMagnifierTarget({ x: 140, y: 120 }, nested, 'row-wide', 0.6)).toBe('row-wide')
  })

  it('falls back to nearest centre within the region for gaps between rows', () => {
    const rows = new Map<string, TargetGeometry>([
      ['row-a', geo(120, 100, 100, 40, 'content')], // centre (170,120)
      ['row-b', geo(120, 160, 100, 40, 'content')], // centre (170,180)
    ])
    // Gap at y=150 sits between the two rows; nearest centre is row-a (30 vs 30,
    // ties to first by iteration order, which is row-a).
    expect(pickMagnifierTarget({ x: 170, y: 150 }, rows, null, 0.6)).toBe('row-a')
  })
})
