import type { Point } from './geometry'

/**
 * Deterministic hand-tremor model for the replay instrument. Nothing here
 * touches Math.random: a given seed always yields the same waveform, so the
 * measured mis-commit rates are reproducible run to run.
 *
 * The model is a sinusoid (the dominant tremor frequency, 3 to 6 Hz for the
 * physiological and Parkinsonian range) plus a small seeded noise term on each
 * axis so the trail is not a clean ellipse. Amplitude is in pixels, tunable to
 * a realistic tremor of a few to roughly twelve pixels.
 */

/**
 * mulberry32: a tiny, fast, well-distributed seeded PRNG. Returns a function
 * that yields the next float in [0, 1). Same seed, same sequence, every run.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface TremorOptions {
  /** Peak displacement of the sinusoid in pixels. */
  amplitudePx: number
  /** Tremor frequency in Hz (3 to 6 covers physiological and Parkinsonian). */
  frequencyHz: number
  /** Fraction of the amplitude added as seeded per-sample noise (0 to 1). */
  noiseFraction: number
  /** Sample rate of the pointer stream in Hz. */
  sampleRateHz: number
}

export const DEFAULT_TREMOR: TremorOptions = {
  amplitudePx: 9,
  frequencyHz: 5,
  noiseFraction: 0.45,
  sampleRateHz: 60,
}

/**
 * Offset the tremor adds to a clean pointer position at sample index `i`.
 * The x and y axes run a quarter cycle out of phase so the hand traces a small
 * wobbling loop rather than a straight line, which is what makes a tremor pull
 * a finger across a target boundary. `rand` is the seeded generator; it is
 * advanced exactly twice per sample so the sequence stays deterministic.
 */
export function tremorOffset(
  i: number,
  opts: TremorOptions,
  rand: () => number,
): Point {
  const { amplitudePx, frequencyHz, noiseFraction, sampleRateHz } = opts
  const t = i / sampleRateHz
  const phase = 2 * Math.PI * frequencyHz * t
  const noiseX = (rand() * 2 - 1) * amplitudePx * noiseFraction
  const noiseY = (rand() * 2 - 1) * amplitudePx * noiseFraction
  return {
    x: Math.sin(phase) * amplitudePx + noiseX,
    y: Math.cos(phase) * amplitudePx + noiseY,
  }
}

/**
 * Build a straight reference path from `from` to `to` with `samples` points,
 * inclusive of both ends. This is the clean intent before any tremor is added.
 */
export function straightPath(from: Point, to: Point, samples: number): Point[] {
  const out: Point[] = []
  const n = Math.max(2, samples)
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1)
    out.push({
      x: from.x + (to.x - from.x) * f,
      y: from.y + (to.y - from.y) * f,
    })
  }
  return out
}

/**
 * A scripted "place a call" pointer path: a straight drag from the orb to the
 * intended contact row, with deterministic tremor added to every sample. Both
 * the waveform and the seeded noise derive from `seed`, so re-running with the
 * same seed reproduces the path exactly.
 */
export function tremorPath(
  from: Point,
  to: Point,
  samples: number,
  seed: number,
  opts: TremorOptions = DEFAULT_TREMOR,
): Point[] {
  const base = straightPath(from, to, samples)
  const rand = mulberry32(seed)
  return base.map((p, i) => {
    const off = tremorOffset(i, opts, rand)
    return { x: p.x + off.x, y: p.y + off.y }
  })
}
