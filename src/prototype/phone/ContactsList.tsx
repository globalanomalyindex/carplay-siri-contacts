import { ContactRow } from './ContactRow'
import { CONTACTS } from './data'

export function ContactsList() {
  return (
    <div data-testid="contacts-list" className="flex flex-col gap-1 overflow-y-auto h-full">
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '0 12px 4px' }}>A</div>
      {CONTACTS.map((c, i) => (
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
