import type { AccessibilitySettings } from '../a11y/useAccessibilitySettings'

export interface DebugPanelProps {
  settings: AccessibilitySettings
  update: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => void
  driving: boolean
  setDriving: (d: boolean) => void
}

export function DebugPanel({ settings, update, driving, setDriving }: DebugPanelProps) {
  return (
    <div
      data-variant="debug-panel"
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        width: 240,
        padding: 16,
        background: 'rgba(20, 30, 40, 0.72)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        lineHeight: 1.5,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.18)',
        zIndex: 200,
      }}
    >
      <div style={{
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize: 10,
        fontWeight: 600,
        marginBottom: 10,
        color: 'rgba(120,220,240,0.85)',
      }}>
        Debug controls
      </div>
      <Toggle
        label="Driving (binary state)"
        value={driving}
        onChange={setDriving}
      />
      <Toggle
        label="Force Reduce Motion"
        value={settings.forceReducedMotion}
        onChange={(v) => update('forceReducedMotion', v)}
      />
      <Toggle
        label="High contrast (bright frames)"
        value={settings.highContrast}
        onChange={(v) => update('highContrast', v)}
      />
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
        Surface switcher lives in the left dock.
      </div>
    </div>
  )
}

function Toggle({ label, value, onChange }: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      data-variant="toggle"
      data-state={value ? 'on' : 'off'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 32,
        padding: '8px 0',
        cursor: 'pointer',
        fontWeight: 400,
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: 'rgba(120,220,240,0.85)', width: 16, height: 16 }}
      />
      <span>{label}</span>
    </label>
  )
}
