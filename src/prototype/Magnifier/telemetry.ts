import type { Point } from './geometry'

/**
 * In-memory telemetry for the magnifier. It records what each gesture actually
 * did so the prototype can show its accessibility thesis on screen: how often
 * the cell-membrane hold rescued a lock, how often a spatial region boundary
 * was crossed, the effort (path length) and accuracy of each commit.
 *
 * This is strictly local. Nothing is persisted, sent over a network, or fed to
 * an analytics SDK. It measures targeting accuracy and effort, never time on
 * screen or engagement.
 */

/**
 * How a commit was produced. A normal lift on the locked target, or a quickdraw
 * (the lens committed live the moment it locked, no lift required). These are
 * the only two outcomes the driver emits.
 */
export type CommitKind = 'lift' | 'quickdraw'

export type TelemetryEvent =
  | { kind: 'sessionStart'; at: number }
  | {
      kind: 'lockChange'
      at: number
      from: string | null
      to: string | null
      /** True when the new lock sits in a different spatial region. */
      crossedRegion: boolean
    }
  | {
      kind: 'membraneSave'
      at: number
      /** The lock the membrane held. */
      heldId: string
      /** The target a naive nearest-centre pass would have jumped to. */
      wouldBeId: string | null
    }
  | {
      kind: 'commit'
      at: number
      targetId: string
      durationMs: number
      pathLengthPx: number
      lockChanges: number
      regionSwitches: number
      commitKind: CommitKind
    }
  | { kind: 'dwellFire'; at: number; targetId: string }

/** One gesture session: an ordered event list with a committed outcome. */
export interface TelemetrySession {
  id: number
  startedAt: number
  events: TelemetryEvent[]
  committedId: string | null
  commitKind: CommitKind | null
  durationMs: number
  pathLengthPx: number
  lockChanges: number
  regionSwitches: number
  membraneSaves: number
}

/** Last N pixel-2 samples are summed; the buffer never grows past this. */
export const MAX_SESSIONS = 50

/** Aggregate metrics across a set of sessions. All effort, never time-on-task. */
export interface TelemetryAggregates {
  sessionCount: number
  committedCount: number
  meanTimeToCommitMs: number
  meanPathLengthPx: number
  membraneSavesPerSession: number
  regionSwitchesPerSession: number
  /** Mis-commit rate over sessions that carried an `intendedId`. */
  misCommitRate: number
  /** Sessions that carried an `intendedId`, used as the mis-commit denominator. */
  scoredCount: number
}

/**
 * A session paired with the target the user was actually trying to hit, used
 * only by the replay so it can score mis-commits. Live sessions have no
 * declared intent and are excluded from the mis-commit rate.
 */
export interface ScoredSession extends TelemetrySession {
  intendedId?: string | null
}

const EMPTY_AGGREGATES: TelemetryAggregates = {
  sessionCount: 0,
  committedCount: 0,
  meanTimeToCommitMs: 0,
  meanPathLengthPx: 0,
  membraneSavesPerSession: 0,
  regionSwitchesPerSession: 0,
  misCommitRate: 0,
  scoredCount: 0,
}

const mean = (xs: number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length

/**
 * Pure aggregation over sessions. Kept side-effect-free and free of any clock
 * read so it is fully unit-testable: the same sessions always yield the same
 * numbers. A "mis-commit" is a session whose declared `intendedId` differs from
 * the id that actually committed; sessions with no declared intent (every live
 * gesture) are simply not scored.
 */
export function computeAggregates(
  sessions: readonly ScoredSession[],
): TelemetryAggregates {
  if (sessions.length === 0) return EMPTY_AGGREGATES

  const committed = sessions.filter((s) => s.committedId !== null)
  const scored = sessions.filter(
    (s) => s.intendedId !== undefined && s.intendedId !== null,
  )
  const misses = scored.filter((s) => s.committedId !== s.intendedId)

  return {
    sessionCount: sessions.length,
    committedCount: committed.length,
    meanTimeToCommitMs: mean(committed.map((s) => s.durationMs)),
    meanPathLengthPx: mean(committed.map((s) => s.pathLengthPx)),
    membraneSavesPerSession: mean(sessions.map((s) => s.membraneSaves)),
    regionSwitchesPerSession: mean(sessions.map((s) => s.regionSwitches)),
    misCommitRate: scored.length === 0 ? 0 : misses.length / scored.length,
    scoredCount: scored.length,
  }
}

/** Distance between two pointer samples; the path-length accumulator term. */
export function segmentLength(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/**
 * Fold an ordered event list into a session summary. Pure: derives every
 * aggregate (commit outcome, path length, counts) from the events alone, so a
 * recorded session can be re-summarised deterministically.
 */
export function summariseSession(
  id: number,
  startedAt: number,
  events: TelemetryEvent[],
): TelemetrySession {
  let committedId: string | null = null
  let commitKind: CommitKind | null = null
  let durationMs = 0
  let pathLengthPx = 0
  let lockChanges = 0
  let regionSwitches = 0
  let membraneSaves = 0

  for (const e of events) {
    switch (e.kind) {
      case 'lockChange':
        lockChanges += 1
        if (e.crossedRegion) regionSwitches += 1
        break
      case 'membraneSave':
        membraneSaves += 1
        break
      case 'commit':
        committedId = e.targetId
        commitKind = e.commitKind
        durationMs = e.durationMs
        pathLengthPx = e.pathLengthPx
        break
      default:
        break
    }
  }

  return {
    id,
    startedAt,
    events,
    committedId,
    commitKind,
    durationMs,
    pathLengthPx,
    lockChanges,
    regionSwitches,
    membraneSaves,
  }
}

/**
 * A capped, in-memory ring buffer of recorded sessions plus the in-flight one.
 * The recorder is plain TS (no React), so the driver, the replay runner, and
 * unit tests all drive it the same way. It never reads a clock itself: callers
 * pass timestamps, which keeps the math reproducible in tests.
 */
export class TelemetryRecorder {
  private sessions: TelemetrySession[] = []
  private current: { id: number; startedAt: number; events: TelemetryEvent[] } | null = null
  private nextId = 1
  private listeners = new Set<() => void>()
  // Cached aggregate snapshot. computeAggregates returns a fresh object, which
  // would make the panel's useSyncExternalStore getSnapshot unstable and loop
  // once any session exists. Caching gives a stable reference until the recorded
  // sessions actually change, then this is nulled to force one recompute.
  private aggregatesCache: TelemetryAggregates | null = null

  /** The cap; exposed for tests and parity with the panel copy. */
  readonly maxSessions = MAX_SESSIONS

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    for (const l of this.listeners) l()
  }

  startSession(at: number): void {
    // A new start without an end (e.g. an aborted gesture) discards the stub.
    this.current = { id: this.nextId++, startedAt: at, events: [{ kind: 'sessionStart', at }] }
    this.emit()
  }

  record(event: TelemetryEvent): void {
    if (!this.current) return
    this.current.events.push(event)
    // Live-update on commit so the panel can show the just-finished gesture.
    if (event.kind === 'commit') this.emit()
  }

  /** Close the in-flight session and push its summary into the ring buffer. */
  endSession(): TelemetrySession | null {
    if (!this.current) return null
    const summary = summariseSession(
      this.current.id,
      this.current.startedAt,
      this.current.events,
    )
    this.sessions.push(summary)
    if (this.sessions.length > MAX_SESSIONS) {
      this.sessions.splice(0, this.sessions.length - MAX_SESSIONS)
    }
    this.aggregatesCache = null
    this.current = null
    this.emit()
    return summary
  }

  /** Abandon the in-flight session without recording it (aborted gesture). */
  abortSession(): void {
    if (!this.current) return
    this.current = null
    this.emit()
  }

  getSessions(): readonly TelemetrySession[] {
    return this.sessions
  }

  getLastSession(): TelemetrySession | null {
    return this.sessions.length ? this.sessions[this.sessions.length - 1] : null
  }

  getAggregates(): TelemetryAggregates {
    if (this.aggregatesCache === null) {
      this.aggregatesCache = computeAggregates(this.sessions)
    }
    return this.aggregatesCache
  }

  clear(): void {
    this.sessions = []
    this.current = null
    this.aggregatesCache = null
    this.emit()
  }
}
