import { useDriving } from './useDriving'

export function UtilityCluster() {
  const driving = useDriving()
  return (
    <div data-testid="utility-cluster" className="ml-auto flex items-center gap-2">
      <UtilButton
        label="#"
        disabled={driving}
        title={driving ? 'Disabled while driving' : 'Keypad'}
      />
      <UtilButton label=">" title="Voicemail" />
    </div>
  )
}

function UtilButton({ label, disabled, title }: { label: string; disabled?: boolean; title: string }) {
  return (
    <button
      aria-label={title}
      title={title}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 7,
        background: 'rgba(255,255,255,0.08)',
        color: 'var(--text-secondary)',
        fontSize: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        border: 'none',
      }}
    >
      {label}
    </button>
  )
}
