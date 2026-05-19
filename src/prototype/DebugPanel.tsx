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
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        width: 240,
        padding: 16,
        background: 'rgba(20, 30, 40, 0.92)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        lineHeight: 1.5,
        backdropFilter: 'blur(8px)',
        zIndex: 200,
      }}
    >
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10, marginBottom: 10, color: 'rgba(120,220,240,0.85)' }}>
        Debug controls
      </div>
      <Toggle
        label="Driving (binary state)"
        value={driving}
        onChange={setDriving}
      />
      <Toggle
        label="Long-press anywhere = rotary"
        value={settings.longPressAnywhere}
        onChange={(v) => update('longPressAnywhere', v)}
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
    </div>
  )
}

function Toggle({ label, value, onChange }: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: 'rgba(120,220,240,0.85)' }}
      />
      <span>{label}</span>
    </label>
  )
}
