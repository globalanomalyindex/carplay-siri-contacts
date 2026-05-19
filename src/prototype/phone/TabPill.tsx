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
  return (
    <div data-testid="tab-pill" className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          data-active={t === active || undefined}
          style={{
            padding: '4px 12px',
            borderRadius: 14,
            background: t === active ? 'rgba(60,180,200,0.30)' : 'transparent',
            color: t === active ? '#b8eef7' : 'rgba(255,255,255,0.75)',
            fontSize: 12,
          }}
        >
          {LABELS[t]}
        </button>
      ))}
    </div>
  )
}
