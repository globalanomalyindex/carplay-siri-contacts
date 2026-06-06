import { describe, it, expect } from 'vitest'
import {
  mulberry32,
  tremorPath,
  straightPath,
  tremorOffset,
  DEFAULT_TREMOR,
} from './tremor'

describe('mulberry32', () => {
  it('is deterministic for a fixed seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = [a(), a(), a(), a()]
    const seqB = [b(), b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('yields different sequences for different seeds', () => {
    const a = mulberry32(1)()
    const b = mulberry32(2)()
    expect(a).not.toBe(b)
  })

  it('stays within [0, 1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 200; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('straightPath', () => {
  it('includes both endpoints and the requested sample count', () => {
    const p = straightPath({ x: 0, y: 0 }, { x: 10, y: 20 }, 5)
    expect(p).toHaveLength(5)
    expect(p[0]).toEqual({ x: 0, y: 0 })
    expect(p[4]).toEqual({ x: 10, y: 20 })
    expect(p[2]).toEqual({ x: 5, y: 10 })
  })
})

describe('tremorOffset', () => {
  it('scales with amplitude', () => {
    const small = tremorOffset(3, { ...DEFAULT_TREMOR, amplitudePx: 4, noiseFraction: 0 }, mulberry32(1))
    const big = tremorOffset(3, { ...DEFAULT_TREMOR, amplitudePx: 12, noiseFraction: 0 }, mulberry32(1))
    expect(Math.hypot(big.x, big.y)).toBeGreaterThan(Math.hypot(small.x, small.y))
  })
})

describe('tremorPath', () => {
  it('reproduces the exact same path for the same seed', () => {
    const from = { x: 0, y: 0 }
    const to = { x: 100, y: 100 }
    const a = tremorPath(from, to, 32, 99)
    const b = tremorPath(from, to, 32, 99)
    expect(a).toEqual(b)
  })

  it('produces a different path for a different seed', () => {
    const from = { x: 0, y: 0 }
    const to = { x: 100, y: 100 }
    const a = tremorPath(from, to, 32, 1)
    const b = tremorPath(from, to, 32, 2)
    // Some sample must differ; the seeded noise diverges.
    const anyDifferent = a.some((p, i) => p.x !== b[i].x || p.y !== b[i].y)
    expect(anyDifferent).toBe(true)
  })

  it('stays near the clean path within the tremor envelope', () => {
    const from = { x: 0, y: 0 }
    const to = { x: 200, y: 0 }
    const clean = straightPath(from, to, 48)
    const jittered = tremorPath(from, to, 48, 5, { ...DEFAULT_TREMOR, amplitudePx: 9 })
    // No sample should stray beyond the amplitude plus its noise share.
    const envelope = 9 * (1 + DEFAULT_TREMOR.noiseFraction) + 0.001
    jittered.forEach((p, i) => {
      expect(Math.abs(p.x - clean[i].x)).toBeLessThanOrEqual(envelope)
      expect(Math.abs(p.y - clean[i].y)).toBeLessThanOrEqual(envelope)
    })
  })
})
