import { useState } from 'react'
import { motion } from 'motion/react'
import { useMagnifierContext } from '../Magnifier'
import { useDriving } from './useDriving'
import { TabPill, type TabId } from './TabPill'
import { FavoritesList } from './FavoritesList'
import { RecentsList } from './RecentsList'
import { ContactsList } from './ContactsList'
import { UtilityCluster } from './UtilityCluster'

const TAB_LOCK_PREFIX = 'tab-'

/**
 * Pass-through tab open: while the rotary magnifier is locked on a tab
 * (lockedId === "tab-favorites" etc.), the displayed tab is derived from
 * the lock so the new content paints under the rotary preview without
 * persisting committed state. The user can then drag down to a row and
 * lift to call. After the lock ends, the displayed tab reverts to the
 * committed `active` value, which matches iOS preview gestures (peek/pop,
 * swipe-back) where temporary previews revert on release. A real
 * commit (lift on a tab) fires the tab's onCommit -> setActive, making
 * the preview stick the same way a tap commit does.
 *
 * Direction gate: the tab preview only fires when the recent gesture trail
 * reads as horizontal. A vertical drag from a higher row passing over the
 * tab pill on the way down would otherwise hijack the visible content.
 */
export function PhoneApp() {
  const driving = useDriving()
  const tabs: TabId[] = driving ? ['favorites', 'recents'] : ['favorites', 'recents', 'contacts']
  const [active, setActive] = useState<TabId>('favorites')
  const { lockedId, gestureDirection } = useMagnifierContext()

  // Derive the previewed tab from the magnifier lock. Falls back to the
  // committed active tab when there is no tab lock OR when the gesture
  // direction is vertical (the user is dragging down through the tab pill,
  // not actually trying to switch tabs).
  const tabLockId =
    lockedId && lockedId.startsWith(TAB_LOCK_PREFIX)
      ? (lockedId.slice(TAB_LOCK_PREFIX.length) as TabId)
      : null
  const previewTab: TabId | null =
    tabLockId && gestureDirection !== 'vertical' ? tabLockId : null
  const displayed: TabId =
    previewTab && tabs.includes(previewTab) ? previewTab : active

  const onSwitch = (next: TabId) => {
    if (tabs.includes(next)) setActive(next)
  }

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      <div className="flex items-center gap-3">
        <TabPill tabs={tabs} active={displayed} onChange={onSwitch} />
        <UtilityCluster />
      </div>
      <div className="flex-1 overflow-hidden relative">
        {/* No AnimatePresence + mode="wait" here: we want the new tab to
            mount immediately so the rotary preview can magnify rows under
            the pointer. The current tab's content swaps via a quick spring
            crossfade keyed on `displayed`. */}
        <motion.div
          key={displayed}
          data-variant="tab-content"
          data-state={displayed}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {displayed === 'favorites' && <FavoritesList />}
          {displayed === 'recents' && <RecentsList />}
          {displayed === 'contacts' && !driving && <ContactsList />}
        </motion.div>
      </div>
    </div>
  )
}
