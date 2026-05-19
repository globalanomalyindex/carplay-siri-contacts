import { motion } from 'motion/react'
import { useMemo, type CSSProperties } from 'react'
import { MagnifiableFrame } from '../Magnifier'
import { ExpandableCell, type CellAction } from '../Magnifier/ExpandableCell'
import { useToast } from '../useToast'

export type DockSurface = 'phone' | 'music' | 'maps'

/** Render variant of an individual dock button. Figma component mapping
 *  key for Code Connect. */
export type DockButtonVariant = 'dock-button'
/** Interactive state of a dock button. */
export type DockButtonState = 'idle' | 'active'

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
]

/**
 * Sensible per-surface actions revealed on hold. These are illustrative for
 * the prototype: in a real CarPlay deployment each dock app would publish
 * its own contextual shortcuts (Apple's CPDockShortcut or equivalent).
 */
function dockActionsFor(
  id: DockSurface,
  fire: (label: string) => void,
  onSwitch: (s: DockSurface) => void,
): CellAction[] {
  switch (id) {
    case 'phone':
      return [
        { id: 'switch', label: 'Open', tone: 'info', variant: 'primary', onAction: () => onSwitch(id) },
        { id: 'recent', label: 'Call recent', tone: 'call', variant: 'primary', onAction: () => fire('Calling last contact') },
        { id: 'voicemail', label: 'Voicemail', tone: 'text', variant: 'secondary', onAction: () => fire('Opening voicemail') },
      ]
    case 'music':
      return [
        { id: 'switch', label: 'Open', tone: 'info', variant: 'primary', onAction: () => onSwitch(id) },
        { id: 'play', label: 'Play queue', tone: 'favorite', variant: 'primary', onAction: () => fire('Playing queue') },
        { id: 'now', label: 'Now playing', tone: 'neutral', variant: 'secondary', onAction: () => fire('Now playing') },
      ]
    case 'maps':
      return [
        { id: 'switch', label: 'Open', tone: 'info', variant: 'primary', onAction: () => onSwitch(id) },
        { id: 'home', label: 'Home', tone: 'favorite', variant: 'primary', onAction: () => fire('Navigating home') },
        { id: 'recent', label: 'Recent', tone: 'neutral', variant: 'secondary', onAction: () => fire('Recent destinations') },
      ]
  }
}

export function DockSwitcher({ surface, onSelect }: DockSwitcherProps) {
  const toast = useToast()
  return (
    <motion.div
      layout
      data-testid="dock-switcher"
      data-variant="dock-switcher"
      style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}
    >
      {DOCK_ITEMS.map((item) => (
        <DockSlot
          key={item.id}
          item={item}
          active={surface === item.id}
          onSelect={onSelect}
          onToast={toast.show}
        />
      ))}
    </motion.div>
  )
}

interface DockSlotProps {
  item: DockItem
  active: boolean
  onSelect: (s: DockSurface) => void
  onToast: (msg: string) => void
}

function DockSlot({ item, active, onSelect, onToast }: DockSlotProps) {
  const actions = useMemo(
    () => dockActionsFor(item.id, onToast, onSelect),
    [item.id, onToast, onSelect],
  )

  return (
    <MagnifiableFrame
      id={`dock-${item.id}`}
      label={`${item.label} surface`}
      onCommit={() => onSelect(item.id)}
    >
      <ExpandableCell
        id={`dock-${item.id}`}
        variant="dock"
        expansionAxis="horizontal"
        actions={actions}
        onTap={() => onSelect(item.id)}
        label={`${item.label} dock item`}
      >
        <DockButton
          active={active}
          label={item.label}
        >
          {item.glyph}
        </DockButton>
      </ExpandableCell>
    </MagnifiableFrame>
  )
}

interface DockButtonProps {
  active: boolean
  label: string
  children: React.ReactNode
}

function DockButton({
  active,
  label,
  children,
}: DockButtonProps) {
  const baseStyle: CSSProperties = {
    // Visual chip is 36; the wrapper expands hit area to 44 (Apple HIG min).
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 180ms cubic-bezier(0.2,0.8,0.3,1), box-shadow 180ms cubic-bezier(0.2,0.8,0.3,1), color 180ms cubic-bezier(0.2,0.8,0.3,1)',
    color: active ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.66)',
    background: active
      ? 'linear-gradient(180deg, rgba(120, 220, 240, 0.32), rgba(120, 220, 240, 0.18))'
      : 'rgba(255, 255, 255, 0.06)',
    boxShadow: active
      ? 'inset 0 0 0 1px rgba(120, 220, 240, 0.55), 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(120, 220, 240, 0.28)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 1px 3px rgba(0,0,0,0.08)',
    position: 'relative',
    padding: 0,
  }

  return (
    // div, not button: the surrounding ExpandableCell owns the press
    // recognition (tap, drag, hold). A nested button would steal focus and
    // double-handle the events. We keep the accessible role + label on the
    // outer cell.
    <div
      role="button"
      aria-label={label}
      aria-pressed={active}
      data-active={active || undefined}
      data-variant="dock-button"
      data-state={active ? 'active' : 'idle'}
      data-testid={`dock-${label.toLowerCase()}`}
      style={{
        // Outer hit-area expansion: 44pt min per Apple HIG.
        minWidth: 44,
        minHeight: 44,
        padding: 4,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={baseStyle}>
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
      </span>
    </div>
  )
}
