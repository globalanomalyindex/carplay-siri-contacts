import { mulberry32 } from './tremor'

export interface Interval { lo: number; hi: number }
export interface PairedOutcome { onMiss: boolean; offMiss: boolean }

const Z = 1.959963984540054

/**
 * Wilson score 95% confidence interval for a binomial proportion.
 * Returns {lo:0, hi:0} when n===0.
 */
export function wilsonInterval(k: number, n: number): Interval {
  if (n === 0) return { lo: 0, hi: 0 }
  const p = k / n
  const z2n = (Z * Z) / n
  const denom = 1 + z2n
  const centre = (p + z2n / 2) / denom
  const half = (Z * Math.sqrt(p * (1 - p) / n + z2n / (4 * n))) / denom
  return { lo: Math.max(0, centre - half), hi: Math.min(1, centre + half) }
}

/**
 * Counts and rates for paired on/off outcomes.
 */
export function pairedRates(
  outcomes: PairedOutcome[],
): { onMiss: number; offMiss: number; onRate: number; offRate: number } {
  const n = outcomes.length
  let onMiss = 0
  let offMiss = 0
  for (const o of outcomes) {
    if (o.onMiss) onMiss++
    if (o.offMiss) offMiss++
  }
  return {
    onMiss,
    offMiss,
    onRate: n === 0 ? 0 : onMiss / n,
    offRate: n === 0 ? 0 : offMiss / n,
  }
}

/**
 * Absolute risk reduction: offRate - onRate.
 */
export function absoluteRiskReduction(onRate: number, offRate: number): number {
  return offRate - onRate
}

/**
 * Risk ratio: onRate / offRate. Returns null when offRate===0.
 */
export function riskRatio(onRate: number, offRate: number): number | null {
  if (offRate === 0) return null
  return onRate / offRate
}

/**
 * Paired percentile bootstrap for ARR and risk ratio.
 * Deterministic: each resample b uses seed (0xB007 + b) >>> 0.
 * B resamples, percentile CI at 2.5% and 97.5%.
 */
export function bootstrapEffect(
  outcomes: PairedOutcome[],
  B: number,
): { arr: Interval; riskRatio: Interval | null } {
  const N = outcomes.length
  const arrSamples: number[] = []
  const rrSamples: number[] = []

  for (let b = 1; b <= B; b++) {
    const rand = mulberry32(((0xB007 + b) >>> 0))
    let onCount = 0
    let offCount = 0
    for (let j = 0; j < N; j++) {
      const idx = Math.floor(rand() * N)
      const o = outcomes[idx]
      if (o.onMiss) onCount++
      if (o.offMiss) offCount++
    }
    const onR = N === 0 ? 0 : onCount / N
    const offR = N === 0 ? 0 : offCount / N
    arrSamples.push(offR - onR)
    if (offR !== 0) {
      rrSamples.push(onR / offR)
    }
  }

  arrSamples.sort((a, b) => a - b)
  const loIdx = Math.floor(0.025 * B)
  const hiIdx = Math.floor(0.975 * B)

  const arrInterval: Interval = {
    lo: arrSamples[loIdx],
    hi: arrSamples[hiIdx],
  }

  let rrInterval: Interval | null = null
  if (rrSamples.length > 0) {
    rrSamples.sort((a, b) => a - b)
    rrInterval = {
      lo: rrSamples[loIdx],
      hi: rrSamples[hiIdx],
    }
  }

  return { arr: arrInterval, riskRatio: rrInterval }
}
