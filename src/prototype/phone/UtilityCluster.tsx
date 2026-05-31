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
      data-variant="util-button"
      data-state={disabled ? 'disabled' : 'idle'}
      style={{
        // Visible chip is 28; padding expands to a 44pt min touch target.
        minWidth: 44, minHeight: 44,
        padding: 8,
        background: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 12,
        fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        border: 'none',
        transition: 'background-color 180ms cubic-bezier(0.2,0.8,0.3,1)',
      }}
    >
      <span
        style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'transform 140ms cubic-bezier(0.08,0.82,0.17,1)',
        }}
      >
        {label}
      </span>
    </button>
  )
}
