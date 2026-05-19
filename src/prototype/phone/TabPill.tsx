import { useCallback, useRef } from 'react'
import { MagnifiableFrame } from '../Magnifier'
import { space } from '../../tokens/spatial'

export type TabId = 'favorites' | 'recents' | 'contacts'

const LABELS: Record<TabId, string> = {
  favorites: 'Favorites',
  recents: 'Recents',
  contacts: 'Contacts',
}

export interface TabPillProps {
  tabs: TabId[]
  active: TabId
  onChange: (next: TabId) => void
}

export function TabPill({ tabs, active, onChange }: TabPillProps) {
  const downRef = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const start = downRef.current
    downRef.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < space.thresholdSwipeTabPx) return
    if (Math.abs(dy) > Math.abs(dx)) return

    const idx = tabs.indexOf(active)
    const nextIdx = dx < 0 ? Math.min(idx + 1, tabs.length - 1) : Math.max(idx - 1, 0)
    if (nextIdx !== idx) onChange(tabs[nextIdx])
  }, [tabs, active, onChange])

  return (
    <div
      data-testid="tab-pill"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(0,0,0,0.18)',
        border: '1px solid rgba(120,220,240,0.18)',
        borderRadius: 18,
        padding: '4px 6px',
        touchAction: 'pan-y',
      }}
    >
      {tabs.map((t, i) => (
        <MagnifiableFrame
          key={t}
          id={`tab-${t}`}
          index={i}
          onCommit={() => onChange(t)}
          label={`${LABELS[t]} tab`}
        >
          <button
            onClick={() => onChange(t)}
            data-active={t === active || undefined}
            style={{
              padding: '4px 12px',
              borderRadius: 14,
              background: t === active ? 'rgba(60,180,200,0.30)' : 'transparent',
              color: t === active ? '#b8eef7' : 'rgba(255,255,255,0.75)',
              fontSize: 12,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {LABELS[t]}
          </button>
        </MagnifiableFrame>
      ))}
    </div>
  )
}
