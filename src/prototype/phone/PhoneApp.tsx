import { useState } from 'react'
import { useDriving } from './useDriving'
import { TabPill, type TabId } from './TabPill'
import { FavoritesList } from './FavoritesList'
import { RecentsList } from './RecentsList'
import { ContactsList } from './ContactsList'
import { UtilityCluster } from './UtilityCluster'

export function PhoneApp() {
  const driving = useDriving()
  const tabs: TabId[] = driving ? ['favorites', 'recents'] : ['favorites', 'recents', 'contacts']
  const [active, setActive] = useState<TabId>('favorites')

  const onSwitch = (next: TabId) => {
    if (tabs.includes(next)) setActive(next)
  }

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      <div className="flex items-center gap-3">
        <TabPill tabs={tabs} active={active} onChange={onSwitch} />
        <UtilityCluster />
      </div>
      <div className="flex-1 overflow-hidden">
        {active === 'favorites' && <FavoritesList />}
        {active === 'recents' && <RecentsList />}
        {active === 'contacts' && !driving && <ContactsList />}
      </div>
    </div>
  )
}
