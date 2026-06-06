import { describe, it, expect } from 'vitest'
import {
  runReplaySeed,
  runReplay,
  compareReplay,
  defaultScenario,
  seedRange,
} from './replay'
import { DEFAULT_TREMOR } from './tremor'

describe('runReplaySeed', () => {
  it('is deterministic: same seed yields the same committed target', () => {
    const scenario = defaultScenario()
    const a = runReplaySeed(scenario, 11, true)
    const b = runReplaySeed(scenario, 11, true)
    expect(a.committedId).toBe(b.committedId)
    expect(a.misCommit).toBe(b.misCommit)
    expect(a.lockChanges).toBe(b.lockChanges)
  })
})

describe('runReplay', () => {
  it('produces a reproducible mis-commit rate over a seed range', () => {
    const scenario = defaultScenario()
    const seeds = seedRange(20)
    const a = runReplay(scenario, seeds, true)
    const b = runReplay(scenario, seeds, true)
    expect(a.misCommitRate).toBe(b.misCommitRate)
  })
})

describe('compareReplay (thesis validation)', () => {
  // This is the load-bearing test: it asserts the accessibility thesis is real,
  // not asserted. At a tremor amplitude where the gating actually matters,
  // region gating ON must mis-commit LESS than the naive picker OFF.
  it('region gating ON mis-commits less than OFF at a realistic tremor', () => {
    const scenario = defaultScenario()
    const seeds = seedRange(20)
    const cmp = compareReplay(scenario, seeds, { ...DEFAULT_TREMOR, amplitudePx: 9 })

    expect(cmp.on.misCommitRate).toBeLessThan(cmp.off.misCommitRate)
    // The naive picker fails on a meaningful share of runs; this is the gap the
    // gating closes. If this ever drops near zero the scenario stopped exercising
    // the failure mode and the comparison is meaningless.
    expect(cmp.off.misCommitRate).toBeGreaterThan(0.2)
  })

  it('holds the advantage across a sweep of realistic amplitudes', () => {
    const scenario = defaultScenario()
    const seeds = seedRange(20)
    for (const amplitudePx of [6, 9, 12]) {
      const cmp = compareReplay(scenario, seeds, { ...DEFAULT_TREMOR, amplitudePx })
      expect(cmp.on.misCommitRate).toBeLessThanOrEqual(cmp.off.misCommitRate)
    }
  })

  it('reports the same comparison every run (full determinism)', () => {
    const scenario = defaultScenario()
    const seeds = seedRange(20)
    const a = compareReplay(scenario, seeds, { ...DEFAULT_TREMOR, amplitudePx: 9 })
    const b = compareReplay(scenario, seeds, { ...DEFAULT_TREMOR, amplitudePx: 9 })
    expect(a.on.misCommitRate).toBe(b.on.misCommitRate)
    expect(a.off.misCommitRate).toBe(b.off.misCommitRate)
    expect(a.reductionAbsolute).toBe(b.reductionAbsolute)
  })
})
