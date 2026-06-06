import { createContext, useContext, useSyncExternalStore } from 'react'
import type { TelemetryRecorder, TelemetryAggregates, TelemetrySession } from './telemetry'

/**
 * The live telemetry recorder, shared by the driver (which writes) and the
 * Measurement panel (which reads). It is provided by MagnifierProvider so the
 * whole prototype subtree sees the same in-memory instrument.
 */
export const TelemetryContext = createContext<TelemetryRecorder | null>(null)

/** The recorder itself, for the driver and the replay runner to write to. */
export function useTelemetryRecorder(): TelemetryRecorder | null {
  return useContext(TelemetryContext)
}

export interface MagnifierTelemetry {
  recorder: TelemetryRecorder | null
  lastSession: TelemetrySession | null
  aggregates: TelemetryAggregates
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

/**
 * Read-side hook for the panel. Subscribes to the recorder so the live readout
 * re-renders when a session completes, with no polling. Returns inert defaults
 * when no provider is present, so embedding the stage without telemetry is safe.
 */
export function useMagnifierTelemetry(): MagnifierTelemetry {
  const recorder = useContext(TelemetryContext)

  const lastSession = useSyncExternalStore(
    (cb) => (recorder ? recorder.subscribe(cb) : () => {}),
    () => (recorder ? recorder.getLastSession() : null),
    () => null,
  )
  const aggregates = useSyncExternalStore(
    (cb) => (recorder ? recorder.subscribe(cb) : () => {}),
    () => (recorder ? recorder.getAggregates() : EMPTY_AGGREGATES),
    () => EMPTY_AGGREGATES,
  )

  return { recorder, lastSession, aggregates }
}
