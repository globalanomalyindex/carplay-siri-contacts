import { ContactRow } from './ContactRow'
import { RECENTS } from './data'

export function RecentsList() {
  return (
    <div data-testid="recents-list" className="flex flex-col gap-1 overflow-y-auto h-full">
      {RECENTS.map((c, i) => (
        <ContactRow
          key={c.id}
          id={c.id}
          name={c.name}
          avatar={c.avatar}
          index={i}
          onCall={() => alert(`Calling ${c.name}`)}
          onText={() => alert(`Texting ${c.name}`)}
        />
      ))}
    </div>
  )
}
