import { describe, it, expect } from 'vitest'
import {
  computeAggregates,
  summariseSession,
  segmentLength,
  TelemetryRecorder,
  type TelemetryEvent,
  type ScoredSession,
} from './telemetry'

describe('segmentLength', () => {
  it('is the Euclidean distance between two samples', () => {
    expect(segmentLength({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    expect(segmentLength({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(0)
  })
})

describe('summariseSession', () => {
  it('folds an event list into commit outcome and counts', () => {
    const events: TelemetryEvent[] = [
      { kind: 'sessionStart', at: 0 },
      { kind: 'lockChange', at: 10, from: null, to: 'tab-a', crossedRegion: false },
      { kind: 'lockChange', at: 20, from: 'tab-a', to: 'row-x', crossedRegion: true },
      { kind: 'membraneSave', at: 30, heldId: 'row-x', wouldBeId: 'tab-a' },
      {
        kind: 'commit',
        at: 40,
        targetId: 'row-x',
        durationMs: 40,
        pathLengthPx: 123,
        lockChanges: 2,
        regionSwitches: 1,
        commitKind: 'lift',
      },
    ]
    const s = summariseSession(7, 0, events)
    expect(s.committedId).toBe('row-x')
    expect(s.commitKind).toBe('lift')
    expect(s.durationMs).toBe(40)
    expect(s.pathLengthPx).toBe(123)
    expect(s.lockChanges).toBe(2)
    expect(s.regionSwitches).toBe(1)
    expect(s.membraneSaves).toBe(1)
  })

  it('records a no-commit session for an aborted gesture', () => {
    const s = summariseSession(1, 0, [
      { kind: 'sessionStart', at: 0 },
      { kind: 'lockChange', at: 5, from: null, to: 'row-x', crossedRegion: false },
    ])
    expect(s.committedId).toBeNull()
    expect(s.commitKind).toBeNull()
    expect(s.lockChanges).toBe(1)
  })

  it('takes the last commit as the outcome (quickdraw then lift)', () => {
    const s = summariseSession(2, 0, [
      { kind: 'sessionStart', at: 0 },
      { kind: 'commit', at: 5, targetId: 'dock-phone', durationMs: 5, pathLengthPx: 10, lockChanges: 1, regionSwitches: 0, commitKind: 'quickdraw' },
      { kind: 'commit', at: 9, targetId: 'row-x', durationMs: 9, pathLengthPx: 40, lockChanges: 2, regionSwitches: 1, commitKind: 'lift' },
    ])
    expect(s.committedId).toBe('row-x')
    expect(s.commitKind).toBe('lift')
  })
})

describe('computeAggregates', () => {
  const make = (over: Partial<ScoredSession>): ScoredSession => ({
    id: 0,
    startedAt: 0,
    events: [],
    committedId: 'row-x',
    commitKind: 'lift',
    durationMs: 100,
    pathLengthPx: 200,
    lockChanges: 1,
    regionSwitches: 0,
    membraneSaves: 0,
    ...over,
  })

  it('returns zeros for an empty set', () => {
    const a = computeAggregates([])
    expect(a.sessionCount).toBe(0)
    expect(a.meanTimeToCommitMs).toBe(0)
    expect(a.misCommitRate).toBe(0)
  })

  it('means only over committed sessions for time and path', () => {
    const a = computeAggregates([
      make({ durationMs: 100, pathLengthPx: 200 }),
      make({ durationMs: 300, pathLengthPx: 400 }),
      make({ committedId: null, durationMs: 9999, pathLengthPx: 9999 }), // aborted, excluded
    ])
    expect(a.sessionCount).toBe(3)
    expect(a.committedCount).toBe(2)
    expect(a.meanTimeToCommitMs).toBe(200)
    expect(a.meanPathLengthPx).toBe(300)
  })

  it('averages membrane saves and region switches over all sessions', () => {
    const a = computeAggregates([
      make({ membraneSaves: 2, regionSwitches: 1 }),
      make({ membraneSaves: 0, regionSwitches: 3 }),
    ])
    expect(a.membraneSavesPerSession).toBe(1)
    expect(a.regionSwitchesPerSession).toBe(2)
  })

  it('scores mis-commits only over sessions that declared an intent', () => {
    const a = computeAggregates([
      make({ committedId: 'row-x', intendedId: 'row-x' }), // hit
      make({ committedId: 'tab-a', intendedId: 'row-x' }), // miss
      make({ committedId: 'tab-a', intendedId: 'row-x' }), // miss
      make({ committedId: 'row-x' }), // no declared intent -> not scored
    ])
    expect(a.scoredCount).toBe(3)
    expect(a.misCommitRate).toBeCloseTo(2 / 3, 6)
  })
})

describe('TelemetryRecorder', () => {
  it('records a session and exposes its summary', () => {
    const r = new TelemetryRecorder()
    r.startSession(0)
    r.record({ kind: 'lockChange', at: 1, from: null, to: 'row-x', crossedRegion: false })
    r.record({ kind: 'commit', at: 2, targetId: 'row-x', durationMs: 2, pathLengthPx: 50, lockChanges: 1, regionSwitches: 0, commitKind: 'lift' })
    const summary = r.endSession()
    expect(summary?.committedId).toBe('row-x')
    expect(r.getLastSession()?.committedId).toBe('row-x')
    expect(r.getAggregates().sessionCount).toBe(1)
  })

  it('returns a stable aggregates reference until the sessions change', () => {
    // getSnapshot for useSyncExternalStore must be referentially stable between
    // renders or the panel loops ("Maximum update depth exceeded") once any
    // session exists. This guards that contract.
    const r = new TelemetryRecorder()
    r.startSession(0)
    r.record({ kind: 'commit', at: 2, targetId: 'row-x', durationMs: 2, pathLengthPx: 50, lockChanges: 1, regionSwitches: 0, commitKind: 'lift' })
    r.endSession()
    const a1 = r.getAggregates()
    expect(r.getAggregates()).toBe(a1)
    r.startSession(3)
    r.record({ kind: 'commit', at: 4, targetId: 'row-y', durationMs: 2, pathLengthPx: 60, lockChanges: 1, regionSwitches: 0, commitKind: 'lift' })
    r.endSession()
    const a2 = r.getAggregates()
    expect(a2).not.toBe(a1)
    expect(a2.sessionCount).toBe(2)
  })

  it('caps the ring buffer at maxSessions', () => {
    const r = new TelemetryRecorder()
    for (let i = 0; i < r.maxSessions + 12; i++) {
      r.startSession(i)
      r.endSession()
    }
    expect(r.getSessions().length).toBe(r.maxSessions)
  })

  it('abortSession discards the in-flight gesture without recording it', () => {
    const r = new TelemetryRecorder()
    r.startSession(0)
    r.record({ kind: 'lockChange', at: 1, from: null, to: 'row-x', crossedRegion: false })
    r.abortSession()
    expect(r.getSessions().length).toBe(0)
    expect(r.getLastSession()).toBeNull()
  })

  it('notifies subscribers and clear() empties the buffer', () => {
    const r = new TelemetryRecorder()
    let calls = 0
    const off = r.subscribe(() => { calls += 1 })
    r.startSession(0)
    r.endSession()
    expect(calls).toBeGreaterThan(0)
    r.clear()
    expect(r.getSessions().length).toBe(0)
    off()
  })
})
