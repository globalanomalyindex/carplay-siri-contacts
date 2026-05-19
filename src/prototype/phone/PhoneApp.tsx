import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useMagnifierContext } from '../Magnifier'
import { useDriving } from './useDriving'
import { TabPill, type TabId } from './TabPill'
import { FavoritesList } from './FavoritesList'
import { RecentsList } from './RecentsList'
import { ContactsList } from './ContactsList'
import { UtilityCluster } from './UtilityCluster'

/**
 * Pass-through tab open: while the rotary magnifier is locked on a tab
 * (lockedId === "tab-favorites" etc.), the parent quietly switches the
 * active tab so the new content paints underneath the rotary preview. If
 * the user keeps dragging onto a row and lifts there, the row's onCommit
 * fires; if they lift on the tab itself, the tab's own onCommit fires the
 * same setActive(...) - same outcome either way.
 */
export function PhoneApp() {
  const driving = useDriving()
  const tabs: TabId[] = driving ? ['favorites', 'recents'] : ['favorites', 'recents', 'contacts']
  const [active, setActive] = useState<TabId>('favorites')
  const { lockedId } = useMagnifierContext()

  // Watch the magnifier lock for a tab id and preview-switch the active
  // tab to match. Idempotent: only writes when the candidate is different
  // from current active, so unrelated locks (contact rows etc.) are noops.
  useEffect(() => {
    if (!lockedId) return
    if (!lockedId.startsWith('tab-')) return
    const candidate = lockedId.slice(4) as TabId
    if (!tabs.includes(candidate)) return
    if (candidate === active) return
    setActive(candidate)
  }, [lockedId, active, tabs])

  const onSwitch = (next: TabId) => {
    if (tabs.includes(next)) setActive(next)
  }

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      <div className="flex items-center gap-3">
        <TabPill tabs={tabs} active={active} onChange={onSwitch} />
        <UtilityCluster />
      </div>
      <div className="flex-1 overflow-hidden relative">
        {/* No AnimatePresence + mode="wait" here: we want the new tab to
            mount immediately so the rotary preview can magnify rows under
            the pointer. The current tab's content swaps via a quick spring
            crossfade keyed on `active`. */}
        <motion.div
          key={active}
          data-variant="tab-content"
          data-state={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {active === 'favorites' && <FavoritesList />}
          {active === 'recents' && <RecentsList />}
          {active === 'contacts' && !driving && <ContactsList />}
        </motion.div>
      </div>
    </div>
  )
}
