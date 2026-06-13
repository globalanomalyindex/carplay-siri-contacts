import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runExperiment, SEED_COUNT, TIERS, SCENARIOS } from './experiment'

describe('experiment guard: replay uses the shipped hit-test', () => {
  it('runExperiment returns exactly 6 cells with valid structure', () => {
    const results = runExperiment()

    // Should return exactly SCENARIOS.length * TIERS.length cells
    const expectedCellCount = SCENARIOS.length * TIERS.length
    expect(results.cells.length).toBe(6)
    expect(results.cells.length).toBe(expectedCellCount)

    // Each cell must have the correct structure
    for (const cell of results.cells) {
      // n should equal SEED_COUNT
      expect(cell.n).toBe(1000)
      expect(cell.n).toBe(SEED_COUNT)

      // Rates must be in [0, 1]
      expect(cell.onRate).toBeGreaterThanOrEqual(0)
      expect(cell.onRate).toBeLessThanOrEqual(1)
      expect(cell.offRate).toBeGreaterThanOrEqual(0)
      expect(cell.offRate).toBeLessThanOrEqual(1)

      // Wilson intervals must be valid: lo <= hi, both in [0, 1]
      expect(cell.onWilson.lo).toBeLessThanOrEqual(cell.onWilson.hi)
      expect(cell.onWilson.lo).toBeGreaterThanOrEqual(0)
      expect(cell.onWilson.hi).toBeLessThanOrEqual(1)

      expect(cell.offWilson.lo).toBeLessThanOrEqual(cell.offWilson.hi)
      expect(cell.offWilson.lo).toBeGreaterThanOrEqual(0)
      expect(cell.offWilson.hi).toBeLessThanOrEqual(1)
    }
  })

  it('replay.ts imports pickMagnifierTargetDiagnostic from geometry', () => {
    const replayPath = resolve(__dirname, './replay.ts')
    const replayContent = readFileSync(replayPath, 'utf-8')

    // Must import the real hit-test used by the live driver
    expect(replayContent).toContain('pickMagnifierTargetDiagnostic')
    expect(replayContent).toContain("from './geometry'")
  })

  it('useMagnifierDriver.ts imports a pick function from geometry', () => {
    const driverPath = resolve(__dirname, './useMagnifierDriver.ts')
    const driverContent = readFileSync(driverPath, 'utf-8')

    // Must import the hit-test function from geometry
    expect(driverContent).toMatch(/from ['"]\.\/geometry['"]/)
    expect(driverContent).toContain('pickMagnifierTargetDiagnostic')
  })
})
