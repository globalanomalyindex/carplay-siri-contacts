import { motion } from 'motion/react'
import { ContactRow } from './ContactRow'
import { FAVORITES } from './data'
import { useToast } from '../useToast'

export function FavoritesList() {
  const toast = useToast()
  return (
    <motion.div
      layout
      data-testid="favorites-list"
      className="flex flex-col gap-1 overflow-y-auto h-full"
    >
      {FAVORITES.map((c, i) => (
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
