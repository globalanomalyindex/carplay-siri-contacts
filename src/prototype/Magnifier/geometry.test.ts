import { describe, it, expect } from 'vitest'
import { distance, pickLockedTarget, isPastHysteresis } from './geometry'

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
