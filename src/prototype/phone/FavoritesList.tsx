import { ContactRow } from './ContactRow'
import { FAVORITES } from './data'

export function FavoritesList() {
  return (
    <div data-testid="favorites-list" className="flex flex-col gap-1 overflow-y-auto h-full">
      {FAVORITES.map((c, i) => (
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
