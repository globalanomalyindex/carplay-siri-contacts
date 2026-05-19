import { motion } from 'motion/react'
import { ContactRow } from './ContactRow'
import { CONTACTS } from './data'
import { useToast } from '../useToast'

export function ContactsList() {
  const toast = useToast()
  return (
    <motion.div
      layout
      data-testid="contacts-list"
      className="flex flex-col gap-1 overflow-y-auto h-full"
    >
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '0 12px 4px' }}>A</div>
      {CONTACTS.map((c, i) => (
        <ContactRow
          key={c.id}
          id={c.id}
          name={c.name}
          avatar={c.avatar}
          index={i}
          onCall={() => toast.show(`Calling ${c.name}`)}
          onText={() => toast.show(`Texting ${c.name}`)}
        />
      ))}
    </motion.div>
  )
}
