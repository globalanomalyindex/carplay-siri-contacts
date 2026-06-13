import { runReplaySeed, defaultScenario, seedRange, type ReplayScenario } from './replay'
import { DEFAULT_TREMOR } from './tremor'
import type { TargetGeometry } from './geometry'
import {
  wilsonInterval,
  pairedRates,
  absoluteRiskReduction as calcAbsoluteRiskReduction,
  riskRatio as calcRiskRatio,
  bootstrapEffect,
  type PairedOutcome,
} from './stats'

// Re-export stats types so experiment.ts is the single home for the canonical
// data contract types.
export type { Interval } from './stats'

export interface ExperimentCell {
  scenarioId: string
  scenarioLabel: string
  tierId: string
  band: string
  amplitudePx: number
  frequencyHz: number
  n: number
  onMisCommits: number
  offMisCommits: number
  onRate: number
  offRate: number
  onWilson: { lo: number; hi: number }
  offWilson: { lo: number; hi: number }
  absoluteRiskReduction: number
  riskRatio: number | null
  bootstrapArr: { lo: number; hi: number }
  bootstrapRiskRatio: { lo: number; hi: number } | null
  meanLockChangesOn: number
  meanMembraneSavesOn: number
}

export interface ExperimentResults {
  kind: 'simulation'
  schemaVersion: number
  seedCount: number
  bootstrapB: number
  generatedNote: string
  tiers: { id: string; band: string; amplitudePx: number; frequencyHz: number }[]
  scenarios: { id: string; label: string }[]
  cells: ExperimentCell[]
}

export const TIERS = [
  { id: 'physiological', band: 'physiological', amplitudePx: 5, frequencyHz: 9 },
  { id: 'essential',     band: 'essential',     amplitudePx: 9, frequencyHz: 5 },
  { id: 'parkinsonian',  band: 'parkinsonian',  amplitudePx: 13, frequencyHz: 4 },
] as const

export const SEED_COUNT = 1000
export const BOOTSTRAP_B = 2000

export function dockContestScenario(): ReplayScenario {
  const rect = (x: number, y: number, w: number, h: number): DOMRect =>
    ({
      x, y, width: w, height: h,
      top: y, left: x, bottom: y + h, right: x + w,
      toJSON: () => ({}),
    }) as DOMRect

  const targets = new Map<string, TargetGeometry>()
  targets.set('dock-phone', { rect: rect(8, 150, 40, 40), region: 'dock' })
  targets.set('dock-music', { rect: rect(8, 196, 40, 40), region: 'dock' })
  targets.set('dock-maps',  { rect: rect(8, 242, 40, 40), region: 'dock' })
  targets.set('tab-favorites', { rect: rect(70, 28, 110, 32), region: 'tabs' })
  const rowIds = ['row-mom', 'row-dad', 'row-sarah', 'row-jake']
  rowIds.forEach((id, i) => {
    targets.set(id, { rect: rect(70, 150 + i * 48, 620, 44), region: 'content' })
  })

  return {
    targets,
    from: { x: 360, y: 360 },
    to: { x: 60, y: 215 },
    intendedId: 'row-dad',
    samples: 48,
  }
}

export const SCENARIOS = [
  { id: 'tab-contest',  label: 'tab / app cross-commit', make: defaultScenario },
  { id: 'dock-contest', label: 'dock rail cross-commit',  make: dockContestScenario },
] as const

export function computeCell(
  scenarioId: string,
  scenarioLabel: string,
  tier: { id: string; band: string; amplitudePx: number; frequencyHz: number },
): ExperimentCell {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!.make()
  const seeds = seedRange(SEED_COUNT)
  const tremor = { ...DEFAULT_TREMOR, amplitudePx: tier.amplitudePx, frequencyHz: tier.frequencyHz }

  const outcomes: PairedOutcome[] = []
  let sumLockChanges = 0
  let sumMembraneSaves = 0

  for (const seed of seeds) {
    const onRun  = runReplaySeed(scenario, seed, true,  tremor)
    const offRun = runReplaySeed(scenario, seed, false, tremor)
    outcomes.push({ onMiss: onRun.misCommit, offMiss: offRun.misCommit })
    sumLockChanges  += onRun.lockChanges
    sumMembraneSaves += onRun.membraneSaves
  }

  const rates = pairedRates(outcomes)
  const onWilson  = wilsonInterval(rates.onMiss,  SEED_COUNT)
  const offWilson = wilsonInterval(rates.offMiss, SEED_COUNT)
  const arr = calcAbsoluteRiskReduction(rates.onRate, rates.offRate)
  const rr  = calcRiskRatio(rates.onRate, rates.offRate)
  const boot = bootstrapEffect(outcomes, BOOTSTRAP_B)

  return {
    scenarioId,
    scenarioLabel,
    tierId: tier.id,
    band: tier.band,
    amplitudePx: tier.amplitudePx,
    frequencyHz: tier.frequencyHz,
    n: SEED_COUNT,
    onMisCommits: rates.onMiss,
    offMisCommits: rates.offMiss,
    onRate: rates.onRate,
    offRate: rates.offRate,
    onWilson,
    offWilson,
    absoluteRiskReduction: arr,
    riskRatio: rr,
    bootstrapArr: boot.arr,
    bootstrapRiskRatio: boot.riskRatio,
    meanLockChangesOn:  sumLockChanges   / SEED_COUNT,
    meanMembraneSavesOn: sumMembraneSaves / SEED_COUNT,
  }
}

export function runExperiment(): ExperimentResults {
  const cells: ExperimentCell[] = []
  for (const scenario of SCENARIOS) {
    for (const tier of TIERS) {
      cells.push(computeCell(scenario.id, scenario.label, tier))
    }
  }
  return {
    kind: 'simulation',
    schemaVersion: 1,
    seedCount: SEED_COUNT,
    bootstrapB: BOOTSTRAP_B,
    generatedNote:
      'simulated first-try mis-commit rates from the seeded tremor replay driving the shipped hit-test. not a human study.',
    tiers: [...TIERS],
    scenarios: SCENARIOS.map((s) => ({ id: s.id, label: s.label })),
    cells,
  }
}
