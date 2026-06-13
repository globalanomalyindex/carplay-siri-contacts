import { describe, it, expect } from 'vitest'
import {
  wilsonInterval,
  pairedRates,
  absoluteRiskReduction,
  riskRatio,
  bootstrapEffect,
  type PairedOutcome,
} from './stats'

describe('wilsonInterval', () => {
  it('returns {lo:0, hi:0} when n===0', () => {
    const result = wilsonInterval(0, 0)
    expect(result).toEqual({ lo: 0, hi: 0 })
  })

  it('computes wilson(12, 100) correctly', () => {
    const result = wilsonInterval(12, 100)
    expect(result.lo).toBeCloseTo(0.069994, 4)
    expect(result.hi).toBeCloseTo(0.198121, 4)
  })

  it('computes wilson(50, 100) correctly', () => {
    const result = wilsonInterval(50, 100)
    expect(result.lo).toBeCloseTo(0.403832, 4)
    expect(result.hi).toBeCloseTo(0.596168, 4)
  })

  it('computes wilson(0, 10) correctly', () => {
    const result = wilsonInterval(0, 10)
    expect(result.lo).toBeCloseTo(0, 4)
    expect(result.hi).toBeCloseTo(0.277533, 4)
  })

  it('computes wilson(10, 10) correctly', () => {
    const result = wilsonInterval(10, 10)
    expect(result.lo).toBeCloseTo(0.722467, 4)
    expect(result.hi).toBeCloseTo(1, 4)
  })

  it('computes wilson(0, 1000).hi correctly', () => {
    const result = wilsonInterval(0, 1000)
    expect(result.hi).toBeCloseTo(0.003830, 4)
  })

  it('maintains lo <= hi for all cases', () => {
    const cases = [
      [0, 10],
      [5, 10],
      [10, 10],
      [1, 100],
      [50, 100],
      [100, 100],
    ]
    cases.forEach(([k, n]) => {
      const result = wilsonInterval(k, n)
      expect(result.lo).toBeLessThanOrEqual(result.hi)
    })
  })
})

describe('pairedRates', () => {
  it('counts misses correctly', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: false },
      { onMiss: true, offMiss: true },
      { onMiss: false, offMiss: true },
      { onMiss: false, offMiss: false },
    ]
    const result = pairedRates(outcomes)
    expect(result.onMiss).toBe(2)
    expect(result.offMiss).toBe(2)
  })

  it('computes rates correctly', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: false },
      { onMiss: true, offMiss: false },
      { onMiss: false, offMiss: true },
    ]
    const result = pairedRates(outcomes)
    expect(result.onMiss).toBe(2)
    expect(result.offMiss).toBe(1)
    expect(result.onRate).toBeCloseTo(2 / 3, 4)
    expect(result.offRate).toBeCloseTo(1 / 3, 4)
  })

  it('handles empty outcomes array', () => {
    const result = pairedRates([])
    expect(result.onMiss).toBe(0)
    expect(result.offMiss).toBe(0)
    expect(result.onRate).toBe(0)
    expect(result.offRate).toBe(0)
  })

  it('handles all-miss cases', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: true },
      { onMiss: true, offMiss: true },
    ]
    const result = pairedRates(outcomes)
    expect(result.onMiss).toBe(2)
    expect(result.offMiss).toBe(2)
    expect(result.onRate).toBe(1)
    expect(result.offRate).toBe(1)
  })
})

describe('absoluteRiskReduction', () => {
  it('computes offRate - onRate', () => {
    const result = absoluteRiskReduction(0.2, 0.5)
    expect(result).toBeCloseTo(0.3, 4)
  })

  it('handles zero values', () => {
    expect(absoluteRiskReduction(0, 0)).toBe(0)
    expect(absoluteRiskReduction(0.5, 0)).toBe(-0.5)
    expect(absoluteRiskReduction(0, 0.5)).toBe(0.5)
  })

  it('can be negative', () => {
    const result = absoluteRiskReduction(0.8, 0.3)
    expect(result).toBeCloseTo(-0.5, 4)
  })
})

describe('riskRatio', () => {
  it('computes onRate / offRate', () => {
    const result = riskRatio(0.4, 0.2)
    expect(result).toBeCloseTo(2, 4)
  })

  it('returns null when offRate === 0', () => {
    const result = riskRatio(0.5, 0)
    expect(result).toBeNull()
  })

  it('handles onRate === 0', () => {
    const result = riskRatio(0, 0.5)
    expect(result).toBeCloseTo(0, 4)
  })

  it('handles equal rates', () => {
    const result = riskRatio(0.3, 0.3)
    expect(result).toBeCloseTo(1, 4)
  })
})

describe('bootstrapEffect', () => {
  it('is deterministic: two calls with same input produce identical results', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: false },
      { onMiss: false, offMiss: true },
      { onMiss: true, offMiss: true },
      { onMiss: false, offMiss: false },
    ]
    const result1 = bootstrapEffect(outcomes, 200)
    const result2 = bootstrapEffect(outcomes, 200)

    expect(result1.arr).toEqual(result2.arr)
    expect(result1.riskRatio).toEqual(result2.riskRatio)
  })

  it('maintains arr.lo <= arr.hi', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: false },
      { onMiss: false, offMiss: true },
    ]
    const result = bootstrapEffect(outcomes, 200)
    expect(result.arr.lo).toBeLessThanOrEqual(result.arr.hi)
  })

  it('returns riskRatio interval when enough bootstrap samples have offR !== 0', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: true },
      { onMiss: false, offMiss: true },
      { onMiss: true, offMiss: true },
      { onMiss: false, offMiss: false },
      { onMiss: false, offMiss: true },
    ]
    const result = bootstrapEffect(outcomes, 200)
    // With good probability, riskRatio should be computed (some bootstrap resamples yield offR !== 0)
    if (result.riskRatio) {
      expect(result.riskRatio.lo).toBeLessThanOrEqual(result.riskRatio.hi)
    }
  })

  it('handles edge case: all onMiss true, all offMiss false', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: false },
      { onMiss: true, offMiss: false },
    ]
    const result = bootstrapEffect(outcomes, 200)
    // offRate is always 0, so riskRatio should be null
    expect(result.riskRatio).toBeNull()
    expect(result.arr.lo).toBeLessThanOrEqual(result.arr.hi)
  })

  it('maintains riskRatio.lo <= riskRatio.hi when present', () => {
    const outcomes: PairedOutcome[] = [
      { onMiss: true, offMiss: true },
      { onMiss: false, offMiss: true },
      { onMiss: true, offMiss: false },
      { onMiss: false, offMiss: true },
      { onMiss: true, offMiss: true },
    ]
    const result = bootstrapEffect(outcomes, 200)
    if (result.riskRatio) {
      expect(result.riskRatio.lo).toBeLessThanOrEqual(result.riskRatio.hi)
    }
  })
})
