import { useCallback, useMemo, useState } from 'react'
import { useMagnifierTelemetry } from './Magnifier/TelemetryContext'
import {
  compareReplay,
  defaultScenario,
  seedRange,
  type ReplayComparison,
} from './Magnifier/replay'
import { DEFAULT_TREMOR } from './Magnifier/tremor'
import type { TelemetrySession, TelemetryAggregates } from './Magnifier/telemetry'

/** Seeds the tremor replay runs. Twenty distinct scripted hands. */
const REPLAY_SEED_COUNT = 20
/** Tremor amplitude (px) used by the on-screen test. Realistic hand tremor. */
const REPLAY_AMPLITUDE_PX = 9

/**
 * The Measurement panel. It surfaces what the magnifier actually did, on
 * screen, so the prototype proves its own accessibility thesis rather than
 * asserting it. Three parts:
 *
 *   - a live readout of the current or last gesture (target, time to commit,
 *     path length, region switches, membrane saves),
 *   - a rolling summary across recent sessions,
 *   - a deterministic tremor replay that runs the same scripted call task with
 *     spatial region gating on vs off and reports the mis-commit reduction.
 *
 * Framing is honest: every number here measures targeting accuracy and effort,
 * never time on screen or engagement. Nothing leaves the page.
 */
export function MeasurementPanel() {
  const { lastSession, aggregates } = useMagnifierTelemetry()
  const [replay, setReplay] = useState<ReplayComparison | null>(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const exportPayload = useMemo(
    () => buildExport(lastSession, aggregates, replay),
    [lastSession, aggregates, replay],
  )

  const onCopy = useCallback(async () => {
    const text = JSON.stringify(exportPayload, null, 2)
    try {
      await navigator.clipboard?.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // Clipboard blocked (insecure context, permissions): fall back to a
      // download so the JSON is still reachable.
      downloadJson(text)
    }
  }, [exportPayload])

  const onExport = useCallback(() => {
    downloadJson(JSON.stringify(exportPayload, null, 2))
  }, [exportPayload])

  const onRunReplay = useCallback(() => {
    setRunning(true)
    // Defer to the next frame so the button shows its running state before the
    // synchronous run blocks. The replay is fast and pure, but this keeps the
    // press from feeling stuck.
    window.requestAnimationFrame(() => {
      const result = compareReplay(defaultScenario(), seedRange(REPLAY_SEED_COUNT), {
        ...DEFAULT_TREMOR,
        amplitudePx: REPLAY_AMPLITUDE_PX,
      })
      setReplay(result)
      setRunning(false)
    })
  }, [])

  return (
    <div data-variant="measurement-panel" style={PANEL_STYLE}>
      <div style={HEADING_STYLE}>Measurement</div>
      <p style={CAPTION_STYLE}>
        Targeting accuracy and effort, measured live. Not time on screen.
      </p>

      <Section title="Last gesture">
        {lastSession ? (
          <Readout session={lastSession} />
        ) : (
          <Empty>Drag the orb onto a control and lift to record a gesture.</Empty>
        )}
      </Section>

      <Section title={`Rolling summary (${aggregates.sessionCount} of ${50})`}>
        {aggregates.committedCount > 0 ? (
          <dl style={STATS_GRID}>
            <Stat label="Mean time to commit" value={`${Math.round(aggregates.meanTimeToCommitMs)} ms`} />
            <Stat label="Mean path length" value={`${Math.round(aggregates.meanPathLengthPx)} px`} />
            <Stat label="Membrane saves / gesture" value={aggregates.membraneSavesPerSession.toFixed(1)} />
            <Stat label="Region switches / gesture" value={aggregates.regionSwitchesPerSession.toFixed(1)} />
          </dl>
        ) : (
          <Empty>No commits recorded yet.</Empty>
        )}
      </Section>

      <Section title="Tremor replay">
        <p style={REPLAY_NOTE_STYLE}>
          A scripted call task with {REPLAY_AMPLITUDE_PX}px hand tremor, run over{' '}
          {REPLAY_SEED_COUNT} seeds with spatial region gating on vs off.
        </p>
        <button
          type="button"
          data-variant="replay-run"
          data-state={running ? 'running' : 'idle'}
          onClick={onRunReplay}
          disabled={running}
          style={RUN_BUTTON_STYLE}
        >
          {running ? 'Running…' : 'Run tremor test'}
        </button>
        {replay && <ReplayReadout result={replay} />}
      </Section>

      <div style={ACTION_ROW_STYLE}>
        <button type="button" data-variant="copy-json" onClick={onCopy} style={GHOST_BUTTON_STYLE}>
          {copied ? 'Copied' : 'Copy session JSON'}
        </button>
        <button type="button" data-variant="export-json" onClick={onExport} style={GHOST_BUTTON_STYLE}>
          Export JSON
        </button>
      </div>
    </div>
  )
}

function Readout({ session }: { session: TelemetrySession }) {
  return (
    <dl style={STATS_GRID}>
      <Stat label="Committed" value={session.committedId ?? 'aborted'} mono />
      <Stat label="Outcome" value={session.commitKind ?? '—'} />
      <Stat label="Time to commit" value={session.committedId ? `${Math.round(session.durationMs)} ms` : '—'} />
      <Stat label="Path length" value={`${Math.round(session.pathLengthPx)} px`} />
      <Stat label="Region switches" value={String(session.regionSwitches)} />
      <Stat label="Membrane saves" value={String(session.membraneSaves)} />
    </dl>
  )
}

function ReplayReadout({ result }: { result: ReplayComparison }) {
  const onPct = Math.round(result.on.misCommitRate * 100)
  const offPct = Math.round(result.off.misCommitRate * 100)
  const drop = Math.round(result.reductionAbsolute * 100)
  return (
    <div data-variant="replay-result" style={REPLAY_RESULT_STYLE}>
      <div style={REPLAY_ROW_STYLE}>
        <span style={REPLAY_LABEL_OFF}>Region gating off</span>
        <span style={REPLAY_VALUE_OFF}>{offPct}% mis-commits</span>
      </div>
      <div style={REPLAY_ROW_STYLE}>
        <span style={REPLAY_LABEL_ON}>Region gating on</span>
        <span style={REPLAY_VALUE_ON}>{onPct}% mis-commits</span>
      </div>
      <div style={REPLAY_SUMMARY_STYLE}>
        {drop > 0
          ? `Region gating removed ${drop} points of mis-commits on this task.`
          : 'No difference on this run.'}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={SECTION_STYLE}>
      <div style={SECTION_TITLE_STYLE}>{title}</div>
      {children}
    </section>
  )
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={STAT_STYLE}>
      <dt style={STAT_LABEL_STYLE}>{label}</dt>
      <dd style={{ ...STAT_VALUE_STYLE, fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined }}>
        {value}
      </dd>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={EMPTY_STYLE}>{children}</div>
}

interface ExportPayload {
  kind: 'magnifier-measurement'
  capturedAt: string
  lastSession: TelemetrySession | null
  aggregates: TelemetryAggregates
  replay: ReplayComparison | null
}

function buildExport(
  lastSession: TelemetrySession | null,
  aggregates: TelemetryAggregates,
  replay: ReplayComparison | null,
): ExportPayload {
  return {
    kind: 'magnifier-measurement',
    capturedAt: new Date().toISOString(),
    lastSession,
    aggregates,
    replay,
  }
}

function downloadJson(text: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'magnifier-measurement.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- Styles. Mirror the DebugPanel glass so the two read as one family. ------

const PANEL_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 24,
  left: 24,
  width: 264,
  padding: 16,
  background: 'rgba(20, 30, 40, 0.72)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 14,
  color: 'rgba(255,255,255,0.85)',
  fontSize: 12,
  lineHeight: 1.5,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.18)',
  zIndex: 200,
}

const HEADING_STYLE: React.CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: 10,
  fontWeight: 600,
  color: 'rgba(120,220,240,0.85)',
}

const CAPTION_STYLE: React.CSSProperties = {
  margin: '6px 0 12px',
  fontSize: 11,
  lineHeight: 1.45,
  color: 'rgba(255,255,255,0.5)',
}

const SECTION_STYLE: React.CSSProperties = {
  marginTop: 12,
  paddingTop: 12,
  borderTop: '1px solid rgba(255,255,255,0.10)',
}

const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.72)',
  marginBottom: 8,
}

const STATS_GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px 10px',
  margin: 0,
}

const STAT_STYLE: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }
const STAT_LABEL_STYLE: React.CSSProperties = { margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.45)' }
const STAT_VALUE_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.92)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const EMPTY_STYLE: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.45,
  color: 'rgba(255,255,255,0.45)',
}

const REPLAY_NOTE_STYLE: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 11,
  lineHeight: 1.45,
  color: 'rgba(255,255,255,0.5)',
}

const RUN_BUTTON_STYLE: React.CSSProperties = {
  width: '100%',
  minHeight: 36,
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid rgba(120,220,240,0.4)',
  background: 'rgba(120,220,240,0.14)',
  color: 'rgba(220,245,255,0.95)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}

const REPLAY_RESULT_STYLE: React.CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const REPLAY_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 8,
}

const REPLAY_LABEL_OFF: React.CSSProperties = { fontSize: 11, color: 'rgba(255,180,170,0.85)' }
const REPLAY_LABEL_ON: React.CSSProperties = { fontSize: 11, color: 'rgba(150,235,200,0.9)' }
const REPLAY_VALUE_OFF: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'rgba(255,150,140,0.95)' }
const REPLAY_VALUE_ON: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'rgba(130,235,190,0.98)' }

const REPLAY_SUMMARY_STYLE: React.CSSProperties = {
  marginTop: 2,
  fontSize: 11,
  lineHeight: 1.45,
  color: 'rgba(255,255,255,0.62)',
}

const ACTION_ROW_STYLE: React.CSSProperties = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: '1px solid rgba(255,255,255,0.10)',
  display: 'flex',
  gap: 8,
}

const GHOST_BUTTON_STYLE: React.CSSProperties = {
  flex: '1 1 0',
  minHeight: 32,
  padding: '6px 10px',
  borderRadius: 9,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.82)',
  fontSize: 11,
  fontWeight: 500,
  cursor: 'pointer',
}
