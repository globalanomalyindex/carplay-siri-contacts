import type { CSSProperties } from 'react'

export type DockSurface = 'phone' | 'music' | 'maps' | 'dialer'

export interface DockSwitcherProps {
  surface: DockSurface
  onSelect: (s: DockSurface) => void
}

interface DockItem {
  id: DockSurface
  label: string
  /** SF-Symbols-style outline icon, rendered into a 22x22 viewBox. */
  glyph: React.ReactNode
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'phone',
    label: 'Phone',
    glyph: (
      <path
        d="M5.5 4.5 C5.5 3.95 5.95 3.5 6.5 3.5 L8.7 3.5 C9.25 3.5 9.7 3.95 9.7 4.5 L9.7 7.3 C9.7 7.85 9.25 8.3 8.7 8.3 L7.55 8.3 C8.55 11.55 11.05 14.05 14.3 15.05 L14.3 13.9 C14.3 13.35 14.75 12.9 15.3 12.9 L18.1 12.9 C18.65 12.9 19.1 13.35 19.1 13.9 L19.1 16.1 C19.1 16.65 18.65 17.1 18.1 17.1 C11.25 17.1 5.5 11.35 5.5 4.5 Z"
        fill="currentColor"
      />
    ),
  },
  {
    id: 'music',
    label: 'Music',
    glyph: (
      <>
        <path
          d="M9.5 16.2 L9.5 7.4 L17.5 5.6 L17.5 14.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7.8" cy="16.4" r="2.2" fill="currentColor" />
        <circle cx="15.8" cy="14.4" r="2.2" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'maps',
    label: 'Maps',
    glyph: (
      <>
        <path
          d="M11 3.2 C8.3 3.2 6.1 5.4 6.1 8.1 C6.1 11.6 11 18 11 18 C11 18 15.9 11.6 15.9 8.1 C15.9 5.4 13.7 3.2 11 3.2 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="8.1" r="1.9" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'dialer',
    label: 'Dialer',
    glyph: (
      <>
        {/* 3x3 grid of dots, evokes a phone keypad */}
        {[5.5, 11, 16.5].map((cx) =>
          [5.5, 11, 16.5].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" fill="currentColor" />
          )),
        )}
      </>
    ),
  },
]

export function DockSwitcher({ surface, onSelect }: DockSwitcherProps) {
  return (
    <div
      data-testid="dock-switcher"
      style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}
    >
      {DOCK_ITEMS.map((item) => (
        <DockButton
          key={item.id}
          active={surface === item.id}
          label={item.label}
          onClick={() => onSelect(item.id)}
        >
          {item.glyph}
        </DockButton>
      ))}
    </div>
  )
}

function DockButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  const baseStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 140ms ease, box-shadow 140ms ease, color 140ms ease',
    color: active ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.66)',
    background: active
      ? 'linear-gradient(180deg, rgba(120, 220, 240, 0.32), rgba(120, 220, 240, 0.18))'
      : 'rgba(255, 255, 255, 0.06)',
    boxShadow: active
      ? 'inset 0 0 0 1px rgba(120, 220, 240, 0.55), 0 4px 14px rgba(120, 220, 240, 0.28)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.10)',
    position: 'relative',
    padding: 0,
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      data-active={active || undefined}
      data-testid={`dock-${label.toLowerCase()}`}
      style={baseStyle}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        aria-hidden
        focusable="false"
        style={{ display: 'block' }}
      >
        {children}
      </svg>
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -5,
            transform: 'translateX(-50%)',
            width: 18,
            height: 2,
            borderRadius: 1,
            background: 'var(--accent-cyan, rgba(120, 220, 240, 0.95))',
            boxShadow: '0 0 6px rgba(120, 220, 240, 0.6)',
          }}
        />
      )}
    </button>
  )
}
