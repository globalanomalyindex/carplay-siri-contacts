import { motion } from 'motion/react'
import { ContactRow } from './ContactRow'
import { RECENTS } from './data'
import { useToast } from '../useToast'

export function RecentsList() {
  const toast = useToast()
  return (
    <motion.div
      layout
      data-testid="recents-list"
      className="flex flex-col gap-1 overflow-y-auto h-full"
    >
      {RECENTS.map((c, i) => (
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
