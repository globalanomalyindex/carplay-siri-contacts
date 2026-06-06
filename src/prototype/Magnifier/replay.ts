import {
  pickMagnifierTargetDiagnostic,
  type Point,
  type TargetGeometry,
} from './geometry'
import { tremorPath, DEFAULT_TREMOR, type TremorOptions } from './tremor'
import { space } from '../../tokens/spatial'

/**
 * Deterministic tremor replay. It drives the SAME hit-test the live driver uses
 * (pickMagnifierTargetDiagnostic, the membrane hysteresis fraction, containment,
 * region gating) over a scripted "place a call" pointer path with reproducible
 * hand jitter, and reports which target a lift would commit. Running it with
 * region gating ON vs OFF over the same seeds measures the mis-commit reduction
 * the spatial gating buys, on screen, rather than as an assertion.
 *
 * It is pure: no DOM, no React, no real pointer. A seed fully determines the
 * path, so the same seed yields the same committed target every run. The driver
 * commits the current lock at lift, so the replay does the same: the lock id at
 * the final sample is the committed id.
 */

export interface ReplayScenario {
  /** Snap targets that compete, keyed by id, with rects and regions. */
  targets: Map<string, TargetGeometry>
  /** Where the gesture begins (the orb's home centre). */
  from: Point
  /** Centre of the intended contact row the user means to lift on. */
  to: Point
  /** Id of the intended contact. A commit on any other id is a mis-commit. */
  intendedId: string
  /** Samples along the path. */
  samples: number
}

export interface ReplayRun {
  seed: number
  committedId: string | null
  misCommit: boolean
  lockChanges: number
  membraneSaves: number
}

export interface ReplayResult {
  regionGating: boolean
  runs: ReplayRun[]
  /** Fraction of runs whose committed id differed from the intended id. */
  misCommitRate: number
}

export interface ReplayComparison {
  on: ReplayResult
  off: ReplayResult
  /** off rate divided by on rate, or null when on rate is 0. */
  reductionFactor: number | null
  /** Absolute drop in mis-commit rate (off minus on), 0 to 1. */
  reductionAbsolute: number
  seeds: number[]
  amplitudePx: number
}

/**
 * Replay one seeded gesture and return the committed target. Mirrors the
 * driver's per-sample lock update exactly: feed each sample through the
 * diagnostic hit-test, carry the lock forward, and commit the final lock as a
 * lift would.
 */
export function runReplaySeed(
  scenario: ReplayScenario,
  seed: number,
  regionGating: boolean,
  tremor: TremorOptions = DEFAULT_TREMOR,
): ReplayRun {
  const path = tremorPath(scenario.from, scenario.to, scenario.samples, seed, tremor)
  let lock: string | null = null
  let lockChanges = 0
  let membraneSaves = 0

  for (const p of path) {
    const pick = pickMagnifierTargetDiagnostic(
      p,
      scenario.targets,
      lock,
      space.membraneHysteresisFraction,
      regionGating,
    )
    if (pick.membraneHeld && lock) membraneSaves += 1
    if (pick.lockId !== lock) {
      lockChanges += 1
      lock = pick.lockId
    }
  }

  return {
    seed,
    committedId: lock,
    misCommit: lock !== scenario.intendedId,
    lockChanges,
    membraneSaves,
  }
}

/** Replay every seed at one gating setting and aggregate the mis-commit rate. */
export function runReplay(
  scenario: ReplayScenario,
  seeds: readonly number[],
  regionGating: boolean,
  tremor: TremorOptions = DEFAULT_TREMOR,
): ReplayResult {
  const runs = seeds.map((seed) => runReplaySeed(scenario, seed, regionGating, tremor))
  const misses = runs.filter((r) => r.misCommit).length
  return {
    regionGating,
    runs,
    misCommitRate: runs.length === 0 ? 0 : misses / runs.length,
  }
}

/** Run both settings over the same seeds and report the reduction. */
export function compareReplay(
  scenario: ReplayScenario,
  seeds: readonly number[],
  tremor: TremorOptions = DEFAULT_TREMOR,
): ReplayComparison {
  const on = runReplay(scenario, seeds, true, tremor)
  const off = runReplay(scenario, seeds, false, tremor)
  return {
    on,
    off,
    reductionFactor: on.misCommitRate === 0 ? null : off.misCommitRate / on.misCommitRate,
    reductionAbsolute: off.misCommitRate - on.misCommitRate,
    seeds: [...seeds],
    amplitudePx: tremor.amplitudePx,
  }
}

/** A contiguous seed range [0, n). */
export function seedRange(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}

/**
 * The default scripted scenario, modelled on the CarPlay layout the prototype
 * renders: a left dock rail, a top tab band, and a stack of wide contact rows
 * in the content region. Rects mirror the 720x400 screen the stage renders.
 *
 * The task aims at the first contact row, but at a spot near its top-left where
 * the finger sits in the narrow gap between the tab band and the first row. A
 * wide row's centre is far to the right, so when a tremor nudges the finger up
 * into that gap a naive nearest-centre picker locks the much closer
 * tab-favorites centre and mis-commits to a tab. Region gating keeps a
 * content-region finger on a content target, which is the failure mode the
 * thesis is about: dragging toward a row should never switch tabs or apps.
 */
export function defaultScenario(): ReplayScenario {
  const rect = (x: number, y: number, w: number, h: number): DOMRect =>
    ({
      x, y, width: w, height: h,
      top: y, left: x, bottom: y + h, right: x + w,
      toJSON: () => ({}),
    }) as DOMRect

  const targets = new Map<string, TargetGeometry>()
  // Left dock rail: three app icons, right edge near x=48, centres near x=28.
  targets.set('dock-phone', { rect: rect(8, 150, 40, 40), region: 'dock' })
  targets.set('dock-music', { rect: rect(8, 196, 40, 40), region: 'dock' })
  targets.set('dock-maps', { rect: rect(8, 242, 40, 40), region: 'dock' })
  // Top tab band: three tabs, bottom edge y=60, favorites centre near (125,44).
  targets.set('tab-favorites', { rect: rect(70, 28, 110, 32), region: 'tabs' })
  targets.set('tab-recents', { rect: rect(186, 28, 110, 32), region: 'tabs' })
  targets.set('tab-contacts', { rect: rect(302, 28, 110, 32), region: 'tabs' })
  // Content rows: a wide stack. The first row tops out at y=96, so the band
  // y=60..96 is a gap between the tabs and the rows. Row centres sit far right
  // (x=380), so a finger in that gap near the left is much closer to a tab.
  const rowIds = ['row-mom', 'row-dad', 'row-sarah', 'row-jake', 'row-kira']
  rowIds.forEach((id, i) => {
    targets.set(id, { rect: rect(70, 96 + i * 48, 620, 44), region: 'content' })
  })

  return {
    targets,
    // Orb home: lower-centre of the screen.
    from: { x: 360, y: 360 },
    // Intended: the first contact row. The aim point sits just above its top
    // edge, in the inter-band gap near the left, the contested zone where a
    // tremor decides between the row and the nearer tab.
    to: { x: 95, y: 90 },
    intendedId: 'row-mom',
    samples: 48,
  }
}
