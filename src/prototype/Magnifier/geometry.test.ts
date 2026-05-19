import { describe, it, expect } from 'vitest'
import { distance, pickLockedTarget, isPastHysteresis, computeGestureDirection } from './geometry'

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
